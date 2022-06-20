use std::cell::RefCell;
use std::collections::{BTreeMap, HashMap};
use candid::Principal;

use ic_cdk::{call, caller, trap};
use ic_cdk_macros::*;

use crate::types::{Action, BatchAction, Movement, Token, TokenError};
use crate::types::Action::Speech;

// const SECOND_UNIT: u64 = 1_000_000_000;

type TokenStore = HashMap<Principal, BTreeMap<String, Token>>;

thread_local! {
    static ACCOUNT_TOKENS: RefCell<TokenStore> = RefCell::default();
}

#[update]
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
    ACCOUNT_TOKENS.with(|t| {
        let mut tt = t.borrow_mut();
        let tokens = match tt.get_mut(&caller) {
            Some(map) => map,
            None => {
                tt.insert(caller,  BTreeMap::new());
                tt.get_mut(&caller).unwrap()
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

#[update]
fn detect_end(scope: String, action: Action) -> Result<bool, TokenError> {
    let caller = caller();
    ACCOUNT_TOKENS.with(|t| {
        let mut map = t.borrow_mut();
        match map.get_mut(&caller) {
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

#[update]
async fn detect_batch_start(scope: String) -> Result<BatchAction, TokenError> {
    let caller = caller();

    // get random
    let management_principal = Principal::management_canister();
    let random_result: std::result::Result<(Vec<u8>,), _> =
        call(management_principal, "raw_rand", ()).await;

    let rands = random_result.unwrap_or_else(|e| {
        trap(&format!("call management canister random number error: {:?}", e));
    }).0;

    ACCOUNT_TOKENS.with(|t| {
        let mut tt = t.borrow_mut();
        let tokens = match tt.get_mut(&caller) {
            Some(map) => map,
            None => {
                tt.insert(caller, BTreeMap::new());
                tt.get_mut(&caller).unwrap()
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

#[update]
fn detect_batch_end(scope: String) -> Result<bool, TokenError> {
    let caller = caller();
    ACCOUNT_TOKENS.with(|t| {
        let mut map = t.borrow_mut();
        match map.get_mut(&caller) {
            Some(tokens) => {
                match tokens.get_mut(&scope) {
                    Some(mut tok) => {
                        tok.active = true;
                        Ok(tok.active)
                    }
                    None => Err(TokenError::TokenNotExist)
                }
            }
            None => Err(TokenError::CallerNotExist)
        }
    })
}

#[query]
fn is_alive(scope: String) -> Result<bool, TokenError> {
    ACCOUNT_TOKENS.with(|t| {
        let map = t.borrow();
        match map.get(&caller()) {
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

#[query]
async fn get_token(scope: String) -> Result<Token, TokenError> {
    ACCOUNT_TOKENS.with(|t| {
        let map = t.borrow();
        match map.get(&caller()) {
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
