dfx canister call live_detect get_token '("aaa")'
#(
#  variant {
#    Ok = record {
#      token = "aaa";
#      action = variant { movement = variant { TurnRight } };
#      active = true;
#      create_at = 1_654_940_512_557_564_000 : nat64;
#    }
#  },
#)

dfx canister call live_detect detect_start  '("aaa", 0)'
dfx canister call live_detect detect_start  '("aaa", 1)'

dfx canister call live_detect detect_end  '("aaa", variant { Speech = "4" })'
#(variant { Ok = true })
dfx canister call live_detect is_alive '("aaa")'
#(variant { Ok = true })
# after 60s
#(variant { Err = variant { TokenExpired } })

