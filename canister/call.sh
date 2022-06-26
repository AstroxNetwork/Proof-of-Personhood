dfx canister call live_detect get_token '("aaa")'
#(
#  variant {
#    Ok = record {
#      action = variant { Move = variant { Mouth } };
#      active = false;
#      create_at = 1_655_399_928_768_515_000 : nat64;
#      scope = "aaa";
#    }
#  },
#)

dfx canister call live_detect detect_start  '("aaa", 0)'
#(variant { Ok = variant { Move = variant { Mouth } } })
dfx canister call live_detect detect_start  '("aaa", 1)'
#(variant { Ok = variant { Speech = "4" } })

dfx canister call live_detect detect_end  '("aaa", variant { Speech = "4" })'

dfx canister call live_detect detect_batch_start  '("aaa")'
dfx canister call live_detect detect_batch_end  '("aaa")'
dfx canister call live_detect detect_secret_end  '("aaa", "AstroXtodamoon",
principal "rrkah-fqaaa-aaaaa-aaaaq-cai")'

dfx canister call live_detect is_alive '("aaa")'

dfx canister --network ic call live_detect detect_batch_start  '("aaa")'
dfx canister --network ic call live_detect detect_batch_end  '("aaa")'


dfx canister --network ic call live_detect is_alive '("aaa")'
#(variant { Ok = true })

#(variant { Ok = true })

dfx deploy --network ic --wallet t35f6-tiaaa-aaaai-acewq-cai --with-cycles 1000000000000


