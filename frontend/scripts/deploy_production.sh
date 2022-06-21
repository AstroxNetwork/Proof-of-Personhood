current_identity=$(dfx identity get-principal)
echo yes | dfx deploy --network ic assets --argument "(record { manager = principal \"$current_identity\" ; salt = null})" --no-wallet
