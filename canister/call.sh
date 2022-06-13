dfx canister call live_detect get_token
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

dfx canister --network ic call live_detect detect_face_start  '("aaa")'
#(variant { Ok = variant { TurnRight } })
dfx canister call live_detect detect_face_live  '("aaa", variant { TurnRight })'
#(variant { Ok = true })
dfx canister call live_detect detect_speech_start  '("aaa")'
#(variant { Ok = "30" })
dfx canister call live_detect detect_speech_live  '("aaa", "30")'
#(variant { Ok = true })
dfx canister call live_detect is_alive '("aaa")'
#(variant { Ok = true })
# after 60s
#(variant { Err = variant { TokenExpired } })

