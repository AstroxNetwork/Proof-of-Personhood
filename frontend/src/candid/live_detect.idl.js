export const idlFactory = ({ IDL }) => {
  const TokenError = IDL.Variant({
    'CallerNotExist' : IDL.Null,
    'TokenNotActive' : IDL.Null,
    'SecretError' : IDL.Null,
    'TokenExpired' : IDL.Null,
    'CallError' : IDL.Null,
    'TokenNotExist' : IDL.Null,
    'TokenInvalid' : IDL.Null,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Nat32, 'Err' : TokenError });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : TokenError });
  const Movement = IDL.Variant({
    'Nod' : IDL.Null,
    'Shake' : IDL.Null,
    'Blink' : IDL.Null,
    'Mouth' : IDL.Null,
  });
  const BatchAction = IDL.Record({
    'movement' : IDL.Vec(Movement),
    'speech' : IDL.Text,
  });
  const Result_2 = IDL.Variant({ 'Ok' : BatchAction, 'Err' : TokenError });
  const Action = IDL.Variant({ 'Move' : Movement, 'Speech' : IDL.Text });
  const Token = IDL.Record({
    'action' : Action,
    'active' : IDL.Bool,
    'create_at' : IDL.Nat64,
    'scope' : IDL.Text,
  });
  const Result_3 = IDL.Variant({ 'Ok' : Token, 'Err' : TokenError });
  return IDL.Service({
    'add_manager' : IDL.Func([IDL.Principal], [], []),
    'claimNFT' : IDL.Func([IDL.Principal, IDL.Text], [Result], []),
    'detect_end' : IDL.Func([IDL.Text], [Result_1], []),
    'detect_start' : IDL.Func([IDL.Text], [Result_2], []),
    'get_nft_canister' : IDL.Func([], [IDL.Principal], ['query']),
    'get_token' : IDL.Func([IDL.Text], [Result_3], ['query']),
    'is_alive' : IDL.Func([IDL.Text], [Result_1], ['query']),
    'is_manager' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'is_user_alive' : IDL.Func(
        [IDL.Principal, IDL.Text],
        [Result_1],
        ['query'],
      ),
    'set_nft_canister' : IDL.Func([IDL.Principal], [], []),
  });
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
