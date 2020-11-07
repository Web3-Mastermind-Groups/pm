# Design Pattern Decisions

## Circuit Breakers (Pause contract functionality)

- Used in case of emergency!

https://consensys.github.io/smart-contract-best-practices/software_engineering/#circuit-breakers-pause-contract-functionality


## Pull over Push Payments (Withdrawal Pattern)

- Used for funds distributions

## State Machine

- Used to update the status of a proposal

Contracts often act as a state machine, where the contract has certain states in which it behaves differently and different functions can and should be called. A function call often ends a stage and moves the contract to the next stage (especially if the contract models interaction). It is also common that some stages are automatically reached at a certain point in time.

The Colony token weighted voting protocol implemented this design pattern to manage the poll state.

Admins can only add poll options in the poll creation stage. Votes can only be submitted when the poll was active. The poll can only be resolved after the poll close time has been reached.

