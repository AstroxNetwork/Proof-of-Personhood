export const idlFactory = ({ IDL }) => {
  const Movement = IDL.Variant({
    'Nod' : IDL.Null,
    'Shake' : IDL.Null,
    'Blink' : IDL.Null,
    'Mouth' : IDL.Null,
  });
  const Action = IDL.Variant({ 'Move' : Movement, 'Speech' : IDL.Text });
  const TokenError = IDL.Variant({
    'CallerNotExist' : IDL.Null,
    'TokenExpired' : IDL.Null,
    'TokenNotExist' : IDL.Null,
    'TokenInvalid' : IDL.Null,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : TokenError });
  const Result_2 = IDL.Variant({ 'Ok' : Action, 'Err' : TokenError });
  const Token = IDL.Record({
    'action' : Action,
    'active' : IDL.Bool,
    'create_at' : IDL.Nat64,
    'scope' : IDL.Text,
  });
  const Result_3 = IDL.Variant({ 'Ok' : Token, 'Err' : TokenError });
  return IDL.Service({
    'detect_end' : IDL.Func([IDL.Text, Action], [Result], []),
    'detect_start' : IDL.Func([IDL.Text, IDL.Nat8], [Result_2], []),
    'get_token' : IDL.Func([IDL.Text], [Result_3], ['query']),
    'is_alive' : IDL.Func([IDL.Text], [Result], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
