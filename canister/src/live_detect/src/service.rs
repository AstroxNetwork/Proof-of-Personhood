use std::cell::RefCell;
use std::collections::{BTreeMap, HashMap};
use ic_cdk::caller;
use ic_types::Principal;
use crate::state::LiveStorage;
use crate::types::*;

thread_local! {
    pub(crate) static SERVICE: RefCell<LiveService> = RefCell::new(LiveService::new());
}

pub struct LiveService {
    pub manager: HashMap<Principal, String>,
    pub nft_canister: Principal,
    pub tokens: HashMap<String, Token>,
}

impl From<&LiveStorage> for LiveService {
    fn from(s: &LiveStorage) -> Self {
        LiveService {
            manager: s.manager.clone(),
            nft_canister: s.nft_canister.clone(),
            tokens: HashMap::default(),
        }
    }
}

impl LiveService {
    pub fn new() -> Self {
        LiveService {
            manager: HashMap::default(),
            nft_canister: Principal::anonymous(),
            tokens: HashMap::default(),
        }
    }

    pub fn init_manager(&mut self, caller: Principal) {
        self.manager.insert(caller, "init manager".to_string());
    }

    pub fn is_manager(&self, caller: Principal) -> bool {
        self.manager.contains_key(&caller)
    }

    pub fn set_active(&mut self, scope: String) -> Result<bool, TokenError> {
        match self.tokens.get_mut(&scope) {
            Some(mut tok) => {
                tok.active = true;
                Ok(tok.active)
            },
            None => Err(TokenError::TokenNotExist)
        }
    }

    pub fn is_active(&self, scope: String) -> Result<bool, TokenError> {
        match self.tokens.get(&scope) {
            Some(mut tok) => {
                Ok(tok.active)
            },
            None => Err(TokenError::TokenNotExist)
        }
    }

    pub fn is_user_active(&self, principal: Principal) -> Result<bool, TokenError> {
        let scope  = format!("astrox://human?principal={}&host=astrox.me", principal.to_string());
        match self.tokens.get(&scope) {
            Some(mut tok) => {
                Ok(tok.active)
            },
            None => Err(TokenError::TokenNotExist)
        }
    }
}

#[inline(always)]
pub fn manager_guard() -> Result<(), String> {
    if SERVICE.with(|ext| ext.borrow().is_manager(ic_cdk::caller())) {
        Ok(())
    } else {
        Err("Not manager".to_string())
    }
}