# Contracts

### _**Not all the functionality described below is implemented.**_

### PM Registry

Individauls wanting to participate in W3MG as a premium member must purchase a subscription.

Their Ethereum address is then added to the PM Registry contract.

### PM Pool

Each week, ETH is sent to the PM Pool contract. The amount of ETH placed in the contract at a time is equal to `C * R` where `C` is the weekly cost in USD of a premium membership subscription and `R` is the number of Ethereum addresses registered in the PM Registry.

### PM Referenda

With the PM Referenda contract, registered Ethereum addresses can create a proposal, view open proposals, and vote on open proposals.

Proposals can include a message in the form of a URI where some data is hosted.

Proposals can alternatively have a script that executes if the propsal is accepted.

- [x] Every proposal is open for voting for a fixed duration

- [ ] PMs are restricted to creating at most 1 proposal per week

- [x] PMs can only vote once and can not change their vote

- [x] All votes are blind commits

- [ ] In order for a propsal to be accepted at least 10% of registered PMs must vote on it

- [x] In order for a propsal to be accepted more than 50% of the votes cast must be to "accept"

- [x] When the voting period ends anyone can reveal the result

- [ ] Executable proposals are executed as soon as their votes are revealed and if the proposal is accepted
