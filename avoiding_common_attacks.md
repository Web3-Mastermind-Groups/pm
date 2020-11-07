# Avoiding Common Attacks

## Re-entracy Attacks (SWC-107)

## Denial of Service with Failed Call (SWC-113)

## Transaction Ordering and Timestamp Dependence (SWC-114)

## Force Sending Ether

Another danger is using logic that depends on the contract balance.

Be aware that it is possible to send ether to a contract without triggering its fallback function.

Using the selfdestruct function on another contract and using the target contract as the recipient will force the destroyed contract’s funds to be sent to the target.

It is also possible to pre-compute a contracts address and send ether to the address before the contract is deployed.

The contract’s balance will be greater than 0 when it is finally deployed.

Many of the coding patterns that are designed to avoid these common attacks are discussed Module 10.
