use std::collections::{BTreeMap};
use candid::Principal;

use candid::{candid_method};
use ic_cdk::{call, caller, trap};
use ic_cdk_macros::*;
use crate::service::{SERVICE, manager_guard};

use crate::types::*;
use crate::types::Action::Speech;

// const SECOND_UNIT: u64 = 1_000_000_000;

// type TokenStore = HashMap<Principal, BTreeMap<String, Token>>;
//
// thread_local! {
//     static ACCOUNT_TOKENS: RefCell<TokenStore> = RefCell::default();
// }

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

#[update(name = "set_nft", guard = "manager_guard")]
#[candid_method(update, rename = "set_nft")]
fn set_nft(nft: Principal) {
    SERVICE.with(|serv| {
        serv.borrow_mut().nft_canister = nft
    });
}

#[query(name = "get_nft", guard = "manager_guard")]
#[candid_method(query, rename = "get_nft")]
fn get_nft() -> Principal {
    SERVICE.with(|ext| {
        ext.borrow().nft_canister
    })
}

#[update(name = "detect_start")]
#[candid_method(update, rename = "detect_start")]
async fn detect_start(scope: String, action_type: u8) -> Result<Action, TokenError> {
    let caller = caller();

    // get random
    let management_principal = Principal::management_canister();
    let random_result: std::result::Result<(Vec<u8>,), _> =
        call(management_principal, "raw_rand", ()).await;

    let rands = random_result.unwrap_or_else(|e| {
        trap(&format!("call management canister random number error: {:?}", e));
    }).0;

    // tokens map
    SERVICE.with(|t| {
        let mut tt = t.borrow_mut();
        let tokens = match tt.tokens.get_mut(&caller) {
            Some(map) => map,
            None => {
                tt.tokens.insert(caller,  BTreeMap::new());
                tt.tokens.get_mut(&caller).unwrap()
            }
        };

        let action: Action;
        match tokens.get_mut(&scope.clone()) {
            Some(tok) => {
                action = tok.clone().action
            }
            None => {
                action = match action_type {
                    0 => Action::Move(Movement::choose(rands[0])),
                    1 => Action::Speech(rands[0].to_string()),
                    _ => trap(&format!("not support type {}", action_type))
                };
                let tok = Token {
                    scope: scope.clone(),
                    action: action.clone(),
                    active: false,
                    create_at: ic_cdk::api::time(),
                };
                tokens.insert(scope.clone(), tok);
            }
        }

        Ok(action)
    })
}

#[update(name = "detect_end")]
#[candid_method(update, rename = "detect_end")]
fn detect_end(scope: String, action: Action) -> Result<bool, TokenError> {
    let caller = caller();
    SERVICE.with(|t| {
        let mut map = t.borrow_mut();
        match map.tokens.get_mut(&caller) {
            Some(tokens) => {
                match tokens.get_mut(&scope) {
                    Some(mut tok) => {
                        if tok.action == action {
                            tok.active = true
                        }
                        Ok(tok.active)
                    }
                    None => Err(TokenError::TokenNotExist)
                }
            }
            None => Err(TokenError::CallerNotExist)
        }
    })
}

#[update(name = "detect_batch_start")]
#[candid_method(update, rename = "detect_batch_start")]
async fn detect_batch_start(scope: String) -> Result<BatchAction, TokenError> {
    let caller = caller();

    // get random
    let management_principal = Principal::management_canister();
    let random_result: std::result::Result<(Vec<u8>,), _> =
        call(management_principal, "raw_rand", ()).await;

    let rands = random_result.unwrap_or_else(|e| {
        trap(&format!("call management canister random number error: {:?}", e));
    }).0;

    SERVICE.with(|t| {
        let mut tt = t.borrow_mut();
        let tokens = match tt.tokens.get_mut(&caller) {
            Some(map) => map,
            None => {
                tt.tokens.insert(caller, BTreeMap::new());
                tt.tokens.get_mut(&caller).unwrap()
            }
        };

        let movement = Movement::choose3(rands[0]);
        let speech = rands[0].to_string();
        let batch = BatchAction { movement, speech: speech.clone() };
        match tokens.get_mut(&scope.clone()) {
            Some(_) => {},
            None => {
                let tok = Token {
                    scope: scope.clone(),
                    action: Speech(speech),
                    active: false,
                    create_at: ic_cdk::api::time(),
                };
                tokens.insert(scope.clone(), tok);
            }
        }
        Ok(batch)
    })

}

#[update(name = "detect_batch_end")]
#[candid_method(update, rename = "detect_batch_end")]
fn detect_batch_end(scope: String) -> Result<bool, TokenError> {
    SERVICE.with(|t| {
        let mut map = t.borrow_mut();
        map.set_active(caller(), scope)
    })
}

#[update(name = "detect_secret_end", guard = "manager_guard")]
#[candid_method(update, rename = "detect_secret_end")]
async fn detect_secret_end(scope: String) -> Result<TokenIndex, TokenError> {
    let caller = caller();
    let result = SERVICE.with(|t| {
        let mut map = t.borrow_mut();
        map.set_active(caller, scope)
    });

    match result {
        Ok(_) => {
            let nft_canister = SERVICE.with(|t| t.borrow().nft_canister);
            let cb = call(
                nft_canister,
                "claimNFT",
                (
                    caller,
                )
            ).await as Result<(TokenIndex,), _>;
            ic_cdk::println!("{:?}", cb);
            match cb {
                Ok(res) => Ok(res.0),
                Err(_) => Err(TokenError::CallError)
            }
        }
        Err(e) => Err(e)
    }
}

#[query(name = "is_alive")]
#[candid_method(query, rename = "is_alive")]
fn is_alive(scope: String) -> Result<bool, TokenError> {
    SERVICE.with(|t| {
        let map = t.borrow();
        match map.tokens.get(&caller()) {
            Some(tokens) => {
                match tokens.get(&scope) {
                    Some(tok) => Ok(tok.active),
                    None => Err(TokenError::TokenNotExist)
                }
            }
            None => Err(TokenError::CallerNotExist)
        }
    })
}

#[query(name = "get_token")]
#[candid_method(query, rename = "get_token")]
async fn get_token(scope: String) -> Result<Token, TokenError> {
    SERVICE.with(|t| {
        let map = t.borrow();
        match map.tokens.get(&caller()) {
            Some(tokens) => {
                match tokens.get(&scope) {
                    Some(tok) => Ok(tok.clone()),
                    None => Err(TokenError::TokenNotExist)
                }
            }
            None => Err(TokenError::CallerNotExist)
        }
    })
}
