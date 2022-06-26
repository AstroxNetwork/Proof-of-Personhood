use ic_cdk::export::candid::{CandidType, Deserialize};
use ic_cdk::trap;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum TokenError {
    CallerNotExist,
    TokenNotExist,
    TokenInvalid,
    TokenExpired,
    SecretError,
    CallError,
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum Movement {
    Blink,
    Mouth,
    Shake,
    Nod,
}

impl Movement {
    pub fn choose(seed: u8) -> Self {
        let n = Some(seed % 4);
        match n {
            Some(0) => Movement::Blink,
            Some(1) => Movement::Mouth,
            Some(2) => Movement::Shake,
            Some(3) => Movement::Nod,
            _ => trap("choose fail")
        }
    }

    pub fn choose3(seed: u8) -> Vec<Movement> {
        let n = Some(seed % 4);
        match n {
            Some(0) => vec![Movement::Blink, Movement::Mouth, Movement::Shake],
            Some(1) => vec![Movement::Mouth, Movement::Shake, Movement::Nod],
            Some(2) => vec![Movement::Shake, Movement::Nod, Movement::Blink],
            Some(3) => vec![Movement::Nod, Movement::Blink, Movement::Mouth],
            _ => trap("choose fail")
        }
    }
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum Action {
    Move(Movement),
    Speech(String),
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub struct BatchAction {
    pub movement: Vec<Movement>,
    pub speech: String
}

pub type TokenIndex = u32;
// pub type AccountIdentifier=String;

// #[derive(Clone, Debug, CandidType, Deserialize, Eq, PartialEq)]
// pub enum User {
//     #[serde(rename = "principal")]
//     Principal(Principal),
//     #[serde(rename = "address")]
//     Address(AccountIdentifier),
// }
//
// #[derive(Clone, Debug, CandidType, Deserialize, Eq, PartialEq)]
// pub struct MintRequest {
//     pub to: User,
//     pub metadata: Option<Vec<u8>>,
// }

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Token {
    pub scope: String,
    pub action: Action,
    pub active: bool,
    pub create_at: u64,
}