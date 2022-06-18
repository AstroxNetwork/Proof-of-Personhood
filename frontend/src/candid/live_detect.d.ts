import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type Action = { 'Move' : Movement } |
  { 'Speech' : string };
export type Movement = { 'Nod' : null } |
  { 'Shake' : null } |
  { 'Blink' : null } |
  { 'Mouth' : null };
export type Result = { 'Ok' : boolean } |
  { 'Err' : TokenError };
export type Result_2 = { 'Ok' : Action } |
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
  { 'TokenExpired' : null } |
  { 'TokenNotExist' : null } |
  { 'TokenInvalid' : null };
export interface _SERVICE {
  'detect_end' : ActorMethod<[string, Action], Result>,
  'detect_start' : ActorMethod<[string, number], Result_2>,
  'get_token' : ActorMethod<[string], Result_3>,
  'is_alive' : ActorMethod<[string], Result>,
}
