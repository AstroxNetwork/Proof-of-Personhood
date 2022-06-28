use std::cell::RefCell;
use std::collections::{HashMap, BTreeMap};

use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use ic_cdk::storage;
use ic_cdk_macros::*;
use ic_kit::*;

use crate::service::{LiveService, SERVICE};
use crate::types::*;

#[derive(Clone, Debug, CandidType, Deserialize)]
pub(crate) struct LiveStorage {
    pub manager: HashMap<Principal, String>,
    pub nft_canister: Principal,
    pub tokens: HashMap<String, Token>,
}

#[pre_upgrade]
pub fn pre_upgrade() {
    match storage::stable_save({
        SERVICE.with(|serv| {
            let s = serv.borrow();
            (LiveStorage {
                manager: s.manager.clone(),
                nft_canister: s.nft_canister.clone(),
                tokens: s.tokens.clone(),
            },)
        })
    }) {
        Ok(_) => {
            ()
        }
        Err(e) => ic::trap(format!("Failed to save state before upgrade: {:?}", e).as_str()),
    };
}

#[post_upgrade]
fn post_upgrade() {
    match storage::stable_restore::<(LiveStorage,)>() {
        Ok(map_stable) => {
            let payload = map_stable.0;
            SERVICE.with(|s| {
                s.replace(LiveService::from(&payload));
            });
        }
        Err(e) => ic::trap(format!("Failed to restored state after upgrade: {:?}", e).as_str()),
    }
}