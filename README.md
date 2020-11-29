# Web3 Mastermind Groups PM Suite

This suite of smart contracts are the interface by which governance in the Web3 Mastermind Groups is conducted.

Premium members (PMs) in W3MG have the opportunity to help shape the practices of the community by voting on proposals.

## Overview

The PM suite maintains an administrator role that gives a single Ethereum address the ability to register PMs.

Any registered PM can submit a proposal and all are encouraged to vote on each proposal. Proposals can relate to any measure, with metadata about the proposal hosted at URI.

# Get Started

Directory Key Components
```
.
├── contracts/       // Solidity smart contracts
├── docs/
│   ├── avoiding_common_attacks.md
│   ├── contracts.md
│   ├── design_pattern_decisions.md
│   └── voting.md
├── src/             // React.js web app
├── test/            // Mocha + Chai contract tests
├── README.md        // You are here!
├── ...
```
## Demo

### Requirements

To run locally you must have [Node.js](https://nodejs.org/en/), [Truffle](https://github.com/trufflesuite/truffle) and [Ganache CLI](https://github.com/trufflesuite/ganache-cli) installed.

To demo how this governance process works, run the commands below in your terminal.
Note that on the local network demo proposals close after 5 minutes.

```
git clone <url>
cd pm
npm install
```

In one terminal window, inside the pm directory, start a local ganache blockchain by running

```
npm run start:ganache
```

This will migrate the contracts to the local blockchain. You will see a 2 private keys for an authorized accounts that can create proposals.
Copy one of the keys to your pasteboard/clipboard (e.g. `CMD + c`).

In another terminal window, inside the pm directory, start the frontend web app by running

```
npm run start:app
```

Navigate to `localhost:3000` in your browser. Using Metamask, import a new account and paste in the private key you copied. Then click connect on the webpage. In Metamask, approve the app's request for access to your accounts. You will then see your connected Ethereum address.
With this account you can create a new proposal and vote on it.

### Mainnet / Testnet

To interact with the application on a live network, run `npm run prod` and select Kovan on Metamask.

## Testing

To run the test suite, run the command `npm run test:contracts`.

The tests cover access control, core functionality, revert conditions, time dependent funcationality, and circuit breaker functionality. This tests ensure the contract behaves in an expected way and does not have any major security holes.

## Specification

The technical specification for the PM Suite can be found here: [docs](./docs)

## Future Work

- Allow funds to be distributed if a proposal gets accepted.
