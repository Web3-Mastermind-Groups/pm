# Avoiding Common Attacks

## Denial of Service by Block Gas Limit or startGas (SWC-128)

In the method `Referenda.tallyVotes`, a loop is used to tally the votes of an arbitrary list of voter ids. This is vulnerable to a DoS attack because the gas required may exceed or be close to the block gas limit. See https://swcregistry.io/docs/SWC-128.

To protect against this attack, a constant uint8 `MAX_VOTES_PER_TALLY` is defined that limits the number of voter ids the caller can include, and therefore restricts the number of loop iterations to that constant.

## Transaction Ordering and Timestamp Dependence (SWC-114)

Because each proposal as a 3-week voting period, votes must be included in a block before the period ends to be valid. If the type of vote (i.e. accept or reject) is known, an attack vector would be possible where votes of a certain type are intentionally not put on chain. See https://swcregistry.io/docs/SWC-114.

To protect against this attack, a commit-reveal (or pre-commit) pattern is used where each vote cast does not reveal the type of vote. Instead, a vote hash that includes random unguessable nonces is put on-chain when a vote is cast. The type of that vote can then be revealed by doing off-chain computation to regenerate the hash.

Furthermore, each subsequent vote for a given proposal includes an additional nonce, making it theoretically more difficult and slower to determine the type of each vote than the rate at which votes can be collected.
