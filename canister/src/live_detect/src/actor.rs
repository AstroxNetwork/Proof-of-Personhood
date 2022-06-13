use std::cell::RefCell;
use candid::Principal;

use ic_cdk::{call, caller, trap};
use ic_cdk_macros::*;

use crate::types::{Action, Movement, Token, TokenError, TokenStore};

const SECOND_UNIT: u64 = 1_000_000_000;

thread_local! {
    static TOKENS: RefCell<TokenStore> = RefCell::default();
}

#[update]
async fn detect_face_start(token: String) -> Result<Movement, TokenError> {
    let caller = caller();
    let management_principal = Principal::management_canister();
    let random_result: std::result::Result<(Vec<u8>,), _> =
        call(management_principal, "raw_rand", ()).await;
    match random_result {
        Ok(result_tuple) => {
            let movement = Movement::choose(result_tuple.0[0]);
            let tok = Token {
                token,
                action: Action::Move(movement.clone()),
                active: false,
                create_at: ic_cdk::api::time(),
            };
            TOKENS.with(|t| {
                t.borrow_mut().insert(caller, tok);
                Ok(movement)
            })
        },
        Err(e) => {
            trap(&format!(
                "claim call managerment canister random number error: {:?}",
                e
            ));
        }
    }


}

#[update]
fn detect_face_live(token: String, movement: Movement) -> Result<bool, TokenError> {
    let caller = caller();
    TOKENS.with(|t| {
        let mut map = t.borrow_mut();
        let opt = map.get_mut(&caller);
        match opt {
            Some(mut tok) => {
                if token != tok.token {
                    return Err(TokenError::TokenInvalid)
                }

                if tok.action.get_move() == movement {
                    tok.active = true;
                    tok.create_at = ic_cdk::api::time()
                }

                Ok(tok.active)
            }
            None => Err(TokenError::TokenNotExist)
        }
    })
}

#[update]
async fn detect_speech_start(token: String) -> Result<String, TokenError> {
    let caller = caller();
    let management_principal = Principal::management_canister();
    let random_result: std::result::Result<(Vec<u8>,), _> =
        call(management_principal, "raw_rand", ()).await;
    match random_result {
        Ok(result_tuple) => {
            let speech = result_tuple.0[0].to_string();
            let tok = Token {
                token,
                action: Action::Speech(speech.clone()),
                active: false,
                create_at: ic_cdk::api::time(),
            };
            TOKENS.with(|t| {
                t.borrow_mut().insert(caller, tok);
                Ok(speech)
            })

        },
        Err(e) => {
            trap(&format!(
                "claim call managerment canister random number error: {:?}",
                e
            ));
        }
    }
}

#[update]
fn detect_speech_live(token: String, speech: String) -> Result<bool, TokenError> {
    let caller = caller();
    TOKENS.with(|t| {
        let mut map = t.borrow_mut();
        let opt = map.get_mut(&caller);
        match opt {
            Some(mut tok) => {
                if token != tok.token {
                    return Err(TokenError::TokenInvalid)
                }

                if tok.action.get_speech() == speech {
                    tok.active = true;
                    tok.create_at = ic_cdk::api::time()
                }

                Ok(tok.active)
            }
            None => Err(TokenError::TokenNotExist)
        }
    })
}


#[query]
fn is_alive(token: String) -> Result<bool, TokenError> {
    TOKENS.with(|t| {
        let map = t.borrow();
        let opt = map.get(&caller());
        match opt {
            Some(tok) => {
                if !tok.active || token != tok.token {
                    return Err(TokenError::TokenInvalid);
                }
                let now = ic_cdk::api::time();
                if now > tok.create_at + 60 * SECOND_UNIT {
                    return Err(TokenError::TokenExpired);
                }
                return Ok(true)
            }
            None => Err(TokenError::TokenNotExist)
        }
    })
}

#[query]
async fn get_token() -> Result<Token, TokenError> {
    TOKENS.with(|t| {
        let map = t.borrow();
        let opt = map.get(&caller());
        match opt {
            Some(tok) => Ok(tok.clone()),
            None => Err(TokenError::TokenNotExist)
        }
    })
}
