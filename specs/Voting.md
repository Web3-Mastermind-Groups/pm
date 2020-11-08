# Voting

A list of open proposals can easily be retrieved by binary search through the proposal
mapping, starting with the latest created proposal which is identified by the current proposal count.

For example, if `proposalCount` is 5, we can traverse proposals by the following
psuedo code.

```
oldestOpen = proposalWithId[proposalCount] if it is open
if no oldestOpen, return 0

proposalToCheck = proposalCount/2
if it is open, go back the difference / 2 and consider all between last and this one open
if it is not open, go forwards the difference / 2
if there is no where left to go, the two left are the split point
```
