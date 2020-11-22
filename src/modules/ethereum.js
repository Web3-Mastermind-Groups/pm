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
