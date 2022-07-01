// @ts-nocheck
import { Principal } from "@dfinity/principal";
import { numberToU8a } from '@polkadot/util';
import { byteArrayToWordArray, generateChecksum, wordArrayToByteArray } from "./binary";
import { ACCOUNT_DOMAIN_SEPERATOR, SUB_ACCOUNT_ZERO } from "./common/constants";
import CryptoJS from 'crypto-js';

export function hasOwnProperty<X extends Record<string, unknown>, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

export const delay = (time: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, time | 1500);
  });
};

type TokenIdentifier = number;
type TokenIndex = number;

export function encode_token_id(
  canister_id: Principal,
  token_index: TokenIndex,
): string {
  const canister_blob = Array.from(canister_id.toUint8Array());

  const data = [10, 116, 105, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  let count = 4;
  for (const b of canister_blob) {
    data[count] = b;
    count += 1;
  }
  const id_blob = Array.from(numberToU8a(token_index, 32));

  for (const c of id_blob) {
    data[count] = c;
    count += 1;
  }

  return Principal.fromUint8Array(new Uint8Array(data)).toText();
}

export const getAccountId = (
  principal: Principal,
  subaccount?: number
): string => {
  const sha = CryptoJS.algo.SHA224.create();
  sha.update(ACCOUNT_DOMAIN_SEPERATOR); // Internally parsed with UTF-8, like go does
  sha.update(byteArrayToWordArray(principal.toUint8Array()));
  const subBuffer = Buffer.from(SUB_ACCOUNT_ZERO);
  if (subaccount) {
    subBuffer.writeUInt32BE(subaccount);
  }
  sha.update(byteArrayToWordArray(subBuffer));
  const hash = sha.finalize();

  /// While this is backed by an array of length 28, it's canonical representation
  /// is a hex string of length 64. The first 8 characters are the CRC-32 encoded
  /// hash of the following 56 characters of hex. Both, upper and lower case
  /// characters are valid in the input string and can even be mixed.
  /// [ic/rs/rosetta-api/ledger_canister/src/account_identifier.rs]
  const byteArray = wordArrayToByteArray(hash, 28);
  const checksum = generateChecksum(byteArray);
  const val = checksum + hash.toString();

  return val;
};


export const validatePrincipalId = (text: string) => {
  try {
    return text === Principal.fromText(text).toString();
  } catch (e) {
    return false;
  }
};