use std::borrow::BorrowMut;
use std::collections::{BTreeMap};
use candid::Principal;

use candid::{candid_method};
use ic_cdk::{call, caller, trap};
use ic_cdk_macros::*;
use crate::service::{SERVICE, manager_guard};

use crate::types::*;

#[init]
#[candid_method(init)]
fn init(manager: Principal) {
    SERVICE.with(|serv| {
        let mut service = serv.borrow_mut();
        service.init_manager(manager);
    });
}

#[update(name = "add_manager", guard = "manager_guard")]
#[candid_method(update, rename = "add_manager")]
fn add_manager(manager: Principal) {
    SERVICE.with(|serv| {
        serv.borrow_mut().init_manager(manager)
    });
}

#[query(name = "is_manager", guard = "manager_guard")]
#[candid_method(query, rename = "is_manager")]
fn is_manager(principal: Principal) -> bool {
    SERVICE.with(|ext| {
        ext.borrow().is_manager(principal)
    })
}

#[update(name = "set_nft_canister", guard = "manager_guard")]
#[candid_method(update, rename = "set_nft_canister")]
fn set_nft_canister(nft: Principal) {
    SERVICE.with(|serv| {
        serv.borrow_mut().nft_canister = nft
    });
}

#[query(name = "get_nft_canister", guard = "manager_guard")]
#[candid_method(query, rename = "get_nft_canister")]
fn get_nft_canister() -> Principal {
    SERVICE.with(|ext| {
        ext.borrow().nft_canister
    })
}

#[update(name = "detect_start")]
#[candid_method(update, rename = "detect_start")]
async fn detect_start(scope: String) -> Result<BatchAction, TokenError> {
    // get random
    let management_principal = Principal::management_canister();
    let random_result: std::result::Result<(Vec<u8>,), _> =
        call(management_principal, "raw_rand", ()).await;

    let rands = random_result.unwrap_or_else(|e| {
        trap(&format!("call management canister random number error: {:?}", e));
    }).0;

    SERVICE.with(|t| {
        let movement = Movement::choose3(rands[0]);
        let speech = rands[0].to_string();
        let batch = BatchAction { movement, speech: speech.clone() };
        let mut tt = t.borrow_mut();
        if !tt.tokens.contains_key(&scope.clone()) {
            let tok = Token {
                scope: scope.clone(),
                action: Action::Speech(speech),
                active: false,
                create_at: ic_cdk::api::time(),
            };
            tt.tokens.insert(scope, tok);
        }

        Ok(batch)
    })

}

#[update(name = "detect_end", guard = "manager_guard")]
#[candid_method(update, rename = "detect_end")]
fn detect_end(scope: String) -> Result<bool, TokenError> {
    SERVICE.with(|t| {
       t.borrow_mut().set_active(scope)
    })
}

#[update(name = "claimNFT")]
#[candid_method(update, rename = "claimNFT")]
async fn claim_nft(principal: Principal, host: String) -> Result<TokenIndex, TokenError> {
    let result = SERVICE.with(|t| { t.borrow().is_user_active(principal, host) });
    match result {
        Ok(active) => {
            if active {
                let nft_canister = SERVICE.with(|t| t.borrow().nft_canister);
                let cb = call(
                    nft_canister,
                    "claimNFT",
                    (
                        principal,
                    )
                ).await as Result<(TokenIndex,), _>;
                ic_cdk::println!("{:?}", cb);
                match cb {
                    Ok(res) => Ok(res.0),
                    Err(_) => Err(TokenError::CallError)
                }
            } else {
                Err(TokenError::TokenNotActive)
            }
        },
        Err(e) => Err(e)
    }
}

#[query(name = "is_user_alive")]
#[candid_method(query, rename = "is_user_alive")]
fn is_user_alive(principal: Principal, host: String) -> Result<bool, TokenError> {
    SERVICE.with(|t| {
        t.borrow().is_user_active(principal, host)
    })
}

#[query(name = "is_alive")]
#[candid_method(query, rename = "is_alive")]
fn is_alive(scope: String) -> Result<bool, TokenError> {
    SERVICE.with(|t| {
        t.borrow().is_active(scope)
    })
}

#[query(name = "get_token")]
#[candid_method(query, rename = "get_token")]
async fn get_token(scope: String) -> Result<Token, TokenError> {
    SERVICE.with(|t| {
        match t.borrow().tokens.get(&scope) {
            Some(tok) => Ok(tok.clone()),
            None => Err(TokenError::TokenNotExist)
        }
    })
}
