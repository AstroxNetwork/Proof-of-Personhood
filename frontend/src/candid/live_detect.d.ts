import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type Action = { 'Move' : Movement } |
  { 'Speech' : string };
export interface BatchAction { 'movement' : Array<Movement>, 'speech' : string }
export type Movement = { 'Nod' : null } |
  { 'Shake' : null } |
  { 'Blink' : null } |
  { 'Mouth' : null };
export type Result = { 'Ok' : number } |
  { 'Err' : TokenError };
export type Result_1 = { 'Ok' : boolean } |
  { 'Err' : TokenError };
export type Result_2 = { 'Ok' : BatchAction } |
  { 'Err' : TokenError };
export type Result_3 = { 'Ok' : Token } |
  { 'Err' : TokenError };
export interface Token {
  'action' : Action,
  'active' : boolean,
  'create_at' : bigint,
  'scope' : string,
}
export type TokenError = { 'CallerNotExist' : null } |
  { 'TokenNotActive' : null } |
  { 'SecretError' : null } |
  { 'TokenExpired' : null } |
  { 'CallError' : null } |
  { 'TokenNotExist' : null } |
  { 'TokenInvalid' : null };
export interface _SERVICE {
  'add_manager' : ActorMethod<[Principal], undefined>,
  'claimNFT' : ActorMethod<[string], Result>,
  'detect_end' : ActorMethod<[string], Result_1>,
  'detect_start' : ActorMethod<[string], Result_2>,
  'get_nft_canister' : ActorMethod<[], Principal>,
  'get_token' : ActorMethod<[string], Result_3>,
  'is_alive' : ActorMethod<[string], Result_1>,
  'is_manager' : ActorMethod<[Principal], boolean>,
  'is_user_alive' : ActorMethod<[Principal, string], Result_1>,
  'set_nft_canister' : ActorMethod<[Principal], undefined>,
}
