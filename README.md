# Web3 Mastermind Groups PM Suite

This suite of smart contracts are the interface by which governance in the Web3 Mastermind Groups is conducted.

Premium members (PMs) in W3MG have the opportunity to help shape the practices of the community by voting on proposals.

## Overview

The PM suite maintains an administrator role that gives a single Ethereum address the ability to register PMs and fund the pool.

Any registered PM can submit a proposal and all are encouraged to vote on each proposal. Proposals can relate to any
measure and most commonly describe how funds in the pool should be allocated. Once a funds proposal passes, funds are immediately distributed.

## Demo

To demo how this governance process works, run the commands below in your terminal.
Note that on the local network demo proposals close after 15 minutes as opposed to 3 weeks.

`git clone <url>`
`cd pm`
`npm install`
`npm run dev`

This will start a local ganache blockchain, migrate the contracts to it, and launch a React.js web app.

In the terminal, you will see a 2 private keys for an authorized accounts that can create proposals.
Copy one of the keys to your pasteboard/clipboard (e.g. `CMD + c`).

Navigate to `localhost:3000` in your browser and approve the app's request for access to your Metamask accounts.
You will then see your connected Ethereum address.
Using metamask, create a new account and paste in the private key you copied.
With this account you can create a new proposal and vote on it.

### Mainnet / Testnet

To interact with the application on a live network, run `npm run prod` and select
Kovan on Metamask.

## Testing

To run the test suite, run the command `truffle test`.

## Specification

The technical specification for the PM Suite can be found here: [docs](./docs)
