use std::collections::BTreeMap;

use ic_cdk::trap;
use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use serde::de::Unexpected::Option;
use crate::types::Action::{movement, speech};

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum TokenError {
    TokenNotExist,
    TokenInvalid,
    TokenExpired,
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum Movement {
    Blink,
    NodNod,
    TurnLeft,
    TurnRight,
}

impl Movement {
    pub fn choose(seed: u8) -> Self {
        let n = Some(seed % 4);
        match n {
            Some(0) => Movement::Blink,
            Some(1) => Movement::NodNod,
            Some(2) => Movement::TurnLeft,
            Some(3) => Movement::TurnRight,
            _ => trap("choose fail")
        }
    }
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum Action {
    movement(Movement),
    speech(String),
}

impl Action {
    pub fn get_move(&self) -> Movement {
        match self {
            Action::movement(mv) => {
                mv.clone()
            }
            Action::speech(sp) => {
                trap("must be movement")
            }
        }
    }

    pub fn get_speech(&self) -> String {
        match self {
            movement(mv) => {
                trap("must be speech")
            }
            speech(sp) => {
                sp.clone()
            }
        }
    }
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Token {
    pub token: String,
    pub action: Action,
    pub active: bool,
    pub create_at: u64,
}

pub type TokenStore = BTreeMap<Principal, Token>;