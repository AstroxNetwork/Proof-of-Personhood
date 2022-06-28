dfx deploy --argument '(principal "gpnv5-a22hm-655yn-uqdyc-nux3k-76clz-t46di-6cz3j-ksayy-ym3tg-qae")'

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

dfx canister call live_detect detect_start  '("astrox://human?principal=5cfvq-ckkxz-hrtdh-iq54o-ju3xo-r6qpu-aicyy-osn3u-ub4c2-xpk42-pae&host=astrox.me")'
dfx canister call live_detect detect_end  '("astrox://human?principal=5cfvq-ckkxz-hrtdh-iq54o-ju3xo-r6qpu-aicyy-osn3u-ub4c2-xpk42-pae&host=astrox.me")'
dfx canister call live_detect is_alive  '("astrox://human?principal=5cfvq-ckkxz-hrtdh-iq54o-ju3xo-r6qpu-aicyy-osn3u-ub4c2-xpk42-pae&host=astrox.me")'
dfx canister call live_detect get_token  '("astrox://human?principal=5cfvq-ckkxz-hrtdh-iq54o-ju3xo-r6qpu-aicyy-osn3u-ub4c2-xpk42-pae&host=astrox.me")'
dfx canister call live_detect is_user_alive  '(principal "5cfvq-ckkxz-hrtdh-iq54o-ju3xo-r6qpu-aicyy-osn3u-ub4c2-xpk42-pae")'


dfx deploy --network ic --wallet t35f6-tiaaa-aaaai-acewq-cai --with-cycles 1000000000000 --argument '(principal "2jlx3-drmhh-yw4yn-ltb5s-gp36o-xvosf-s6dqt-xeq62-3x4fc-s7ozz-iqe")'

dfx canister --network ic call live_detect add_manager '(principal "myumu-2ldby-a7hcq-k7fy3-fpfpy-npwpa-fwh5f-qko6o-xniph-n6atx-vae")'
dfx canister --network ic call live_detect is_manager '(principal "myumu-2ldby-a7hcq-k7fy3-fpfpy-npwpa-fwh5f-qko6o-xniph-n6atx-vae")'
dfx canister --network ic call live_detect claimNFT '(principal "myumu-2ldby-a7hcq-k7fy3-fpfpy-npwpa-fwh5f-qko6o-xniph-n6atx-vae")'
# myumu-2ldby-a7hcq-k7fy3-fpfpy-npwpa-fwh5f-qko6o-xniph-n6atx-vae
# didf6-xaaaa-aaaai-acmjq-cai
dfx canister --network ic call live_detect set_nft '(principal "didf6-xaaaa-aaaai-acmjq-cai")'
dfx canister --network ic call live_detect set_nft '(principal "didf6-xaaaa-aaaai-acmjq-cai")'

dfx canister --network ic call live_detect get_nft


dfx canister --network ic call live_detect is_alive '("aaa")'
#(variant { Ok = true })

#(variant { Ok = true })

dfx deploy --network ic --wallet t35f6-tiaaa-aaaai-acewq-cai --with-cycles 1000000000000


