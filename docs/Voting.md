# Voting

## Vote Mining

Casting a vote is a two part process with an off-chain and on-chain component.

First, off-chain, the PM generates their vote by taking the hash of
1. the id of the proposal they are voting on
2. their registered Ethereum address
3. 0 for reject or 1 for accept
4. at least one random integer (nonce) in the range 2^53 - 1

Then the PM publishes this hash on chain in a transaction to the Referenda contract.

A vote can be revealed by mining to generate this hash. Mining becomes more difficult as the number of votes cast increases, making it computationally expensive to determine the outcome of a proposal.

### Notes

The difficulty can be adjusted.

## Finding Open Proposals

A list of open proposals can easily be retrieved by binary search through the proposal
mapping, starting with the latest created proposal which is identified by the current proposal count.
