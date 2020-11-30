import assert from "assert";
import Web3 from "web3";

/**
 * Returns the 10 most recently created proposals
 * @param {object} contract Referenda contract
 */
export async function getProposals(contract) {
  const proposals = [];
  const proposalCountString = await contract.methods.proposalCount().call();
  const proposalCount = Web3.utils.toBN(proposalCountString);

  let startingId = Web3.utils.toBN(1);
  if (proposalCount.gt(Web3.utils.toBN(10))) {
    startingId = proposalCount.minus(Web3.utils.toBN(9));
  }

  let index = proposalCount;
  while (index.gt(startingId.sub(Web3.utils.toBN(1))) == true) {
    console.log(index.toString());
    proposals.push(await contract.methods.proposalWithId(index).call());
    index = index.sub(Web3.utils.toBN(1));
  }
  return proposals;
}

export async function createReferendaProposal(contract, from, link, value, recipient) {
  try {
    const txReceipt = await contract.methods.createProposal(link, value, recipient).send({ from });
    return [null, txReceipt];
  } catch (error) {
    return [error.message, null];
  }
}

export async function generateVoteHash(contract, voterAddress, proposalId, voteType) {
  assert(Web3.utils.isBN(proposalId) === true, "proposalId must be a BN object");
  assert(Web3.utils.isAddress(voterAddress) === true, "voterAddress must be a valid ETH address");
  assert(typeof voteType === "number", "voteType must be of type number");
  assert(voteType > 0, "voteType must be 1 for accept or 2 for reject");
  assert(voteType < 3, "voteType must be 1 for accept or 2 for reject");

  const proposal = await contract.methods.proposalWithId(proposalId).call();

  const nonces = [];
  // TODO: Check for slippage threshold with proposal vote count
  for (let n = -1; n < proposal.voteCount; n++) {
    nonces.push(getRandomInt(Number.MAX_SAFE_INTEGER));
  }
  const voteHash = Web3.utils.soliditySha3(
    { type: "uint256", value: proposalId },
    { type: "address", value: voterAddress },
    { type: "uint8", value: voteType },
    { type: "uint256[]", value: nonces }
  );

  return [voteHash, nonces];
}

/**
 * Execute vote on referenda contract
 * @param {object} contract Referenda contract
 * @param {string} from Voter address
 * @param {object} proposalId Id of proposal as a BN
 * @param {string} voteHash Keccak256 hash
 * @dev hash parameters must include: `proposalId`, `from`, vote type, and nonce array
 */
export async function vote(contract, from, proposalId, voteHash) {
  try {
    const txReceipt = await contract.methods.vote(proposalId, voteHash).send({ from });
    return [null, txReceipt];
  } catch (error) {
    return [error.message, null];
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
