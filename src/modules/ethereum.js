import assert from "assert";
import Web3 from "web3";

export async function createReferendaProposal(contract, from, link, value, recipient) {
  link = Web3.utils.fromAscii(link);
  try {
    const txReceipt = await contract.methods.createProposal(link, value, recipient).send({ from });
    return [null, txReceipt];
  } catch (error) {
    return [error.message, null];
  }
}

export async function generateVoteHash(contract, proposalId, voterAddress, voteType) {
  assert(Web3.utils.isBN(proposalId) === true, "proposalId must be a BN object");
  assert(Web3.utils.isAddress(voterAddress) === true, "voterAddress must be a valid ETH address");
  assert(typeof voteType === "number", "voteType must be of type number");

  const proposal = await contract.proposalWithId.call(proposalId);

  const nonces = [];
  // TODO: Check for slippage threshold with proposal vote count
  for (let n = -1; n < proposal.voteCount; n++) {
    nonces.push(getRandomInt(Number.MAX_SAFE_INTEGER));
  }
  const voteHash = Web3.utils.soliditySha3(
    {type: "uint256", value: proposalId},
    {type: "address", value: voterAddress},
    {type: "uint8", value: voteType},
    {type: "uint256[]", value: nonces}
  );

  return [voteHash, nonces];
}

/**
 * Execute vote on referenda contract
 * @param {object} contract Referenda contract
 * @param {string} from Voter address
 * @param {Array<string>} voteParams Inputs of vote hash
 * @param {string} voteHash Keccak256 hash of `voteParams`
 * @dev voteParams must include: `proposalId`, `voterAddress`, `voteType`
 */
export async function vote(contract, from, voteParams, voteHash) {
  try {
    const txReceipt = await contract.methods.vote(...voteParams, voteHash).send({ from });
    return [null, txReceipt];
  } catch (error) {
    return [error.message, null];
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
