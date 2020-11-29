# Design Pattern Decisions

## Circuit Breakers (Pause contract functionality)
https://consensys.github.io/smart-contract-best-practices/software_engineering/#circuit-breakers-pause-contract-functionality

In the event that there is malicious voting activity or a proposal is created that could have harmful effects on future governance, the admin can temporarily stop execution of the following methods:

- `Referenda.createProposal`
- `Referenda.vote`

When the contract is stopped, the admin can remove the proposal where the malicious activity was detected.

## Restricting Access

The Registry contract is used to assign roles to accounts based by importing [Open Zeppelin's Access Control model](https://docs.openzeppelin.com/contracts/3.x/access-control). The Referenda contract then restricts access to some of its functions based on the role assigned to the caller.

Methods with restricted access include:
- `Referenda.createProposal`
- `Referenda.removeProposal`
- `Referenda.vote`
- `Referenda.setStopped`
- `Referenda.calculateOutcome`

## Other design patterns

In general, all contract methods are implemented so that state changes that would restrict access are updated first in order to avoid re-entrancy attacks. For example, when `vote` is called, the `proposalVoteWithId` is the first state change so that if someone tries to re-enter the function the call will get reverted because the contract will see they have already voted.

Other common design patterns were not relevant to this project at this point in time, particularly because it does not handle exchange of funds.
