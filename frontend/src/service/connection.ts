import { Actor, ActorSubclass, HttpAgent, SignIdentity } from "@dfinity/agent";
import { InterfaceFactory } from "@dfinity/candid/lib/cjs/idl";
import { idlFactory } from '../candid/live_detect.idl';
import { _SERVICE } from '../candid/live_detect';
import { idlFactory as NFT_idlFactory  } from '../candid/pop_nft.idl';
import { _SERVICE as NFT_SERVICE } from '../candid/pop_nft.did';
const canisterId = 'gfjra-iaaaa-aaaai-aclia-cai';
export interface CreateActorResult<T> {
  actor: ActorSubclass<T>;
  agent: HttpAgent;
}

export async function _createActor<T>(
  interfaceFactory: InterfaceFactory,
  canisterId: string,
  identity?: SignIdentity,
  host?: string,
): Promise<CreateActorResult<T>> {
  console.log('ENV', NODE_ENV)
  const agent = new HttpAgent({ identity, host: NODE_ENV !== 'production' ? 'http://localhost:8000' : 'https://ic0.app' });
  // Only fetch the root key when we're not in prod
  if (NODE_ENV !== 'production') {
    await agent.fetchRootKey();
  }
  const actor = Actor.createActor<T>(interfaceFactory, {
    agent,
    canisterId,
  });
  return { actor, agent };
}


export async function getActor<T>(interfaceFactory: InterfaceFactory, canisterId: string, identity?: SignIdentity) {
  return await _createActor<T>(interfaceFactory, canisterId, identity)
}
console.log(process.env)
console.log(process.env.LIVE_DETECT_CANISTER_ID)
console.log(process.env.POP_NFT_CANISTER_ID)
export const popConnection = async (identity: SignIdentity) =>  (await getActor<_SERVICE>(idlFactory, process.env.LIVE_DETECT_CANISTER_ID, identity));
export const popNFTConnection = async (identity: SignIdentity) =>  (await getActor<NFT_SERVICE>(NFT_idlFactory, process.env.POP_NFT_CANISTER_ID, identity));