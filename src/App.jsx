import React from "react";
import ConnectButton from "./components/ConnectButton";
import Ethereum from "./components/Ethereum";
import Context from "./context";
import Home from "./views/Home";

import { createReferendaProposal, generateVoteHash } from "./modules/ethereum";

function App() {
  const [web3, setWeb3] = React.useState(null);
  const [referenda, setReferenda] = React.useState(null);
  const [startEthereum, setStartEthereum] = React.useState(false);
  const [ethereumConnected, setEthereumConnected] = React.useState(false);
  const [ethereumAccounts, setEthereumAccounts] = React.useState(null);

  const state = {
    startEthereum,
    setStartEthereum,
    web3,
    setWeb3,
    referenda,
    setReferenda,
    ethereumConnected,
    setEthereumConnected,
    ethereumAccounts,
    setEthereumAccounts,
    createReferendaProposal: async (...args) => await createReferendaProposal(referenda, web3.eth.defaultAccount, ...args),
    generateVoteHash: async (...args) => await generateVoteHash(referenda, web3.eth.defaultAccount, ...args)
  };
 
  return (
    <Context.Provider value={state}>
      <Ethereum initialize={startEthereum} />
      <h1>Web3 Mastermind Groups PM Suite</h1>
      <ConnectButton />
      {ethereumConnected && <Home />}
    </Context.Provider>
  );
}

export default App;
