import load from "blake3/browser-async";

export async function generateVote(address, proposalId, accept, previousVoteHash) {
  const opinion = accept ? 1 : 0;
  const blake3 = await load();
  const hash = blake3.hash(`${address}${proposalId}${opinion}${previousVoteHash}`);
  console.log(hash);
  return hash;
}
