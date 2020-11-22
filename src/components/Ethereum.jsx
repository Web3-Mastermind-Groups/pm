import detectEthereumProvider from "@metamask/detect-provider";
import React from "react";
import Web3 from "web3";

import Context from "../context";
import Referenda from "../contracts/Referenda.json";

function Ethereum() {
  const state = React.useContext(Context);
  let started = false;

  React.useEffect(() => {
    if (state.startEthereum && !started) {
      started = true;
      console.log("am i looping?");
      connect();
    }
  }, [state]);

  /**
   * Connects and sets Ethereum accounts.
   */
  async function connect() {
    state.setStartEthereum(false);
    if (typeof window.ethereum !== "undefined") {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const provider = await detectEthereumProvider();

      console.log(accounts);

      const web3 = new Web3(provider);
      state.setWeb3(web3);
      web3.eth.defaultAccount = accounts[0];

      initializeContracts(web3);
      startListeners();

      state.setEthereumAccounts(accounts);
      state.setEthereumConnected(true);
    } else {
      throw Error("Could not find ethereum in window.");
    }
  }

  function initializeContracts(_web3) {
    const referenda = new _web3.eth.Contract(Referenda.abi, process.env.REACT_APP_ETH_LOCAL_REFERENDA_ADDRESS);
    state.setReferenda(referenda);
  }

  function startListeners() {
    if (!ethereum) {
      throw Error("`ethereum` does not exist");
    }
    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);
  }
  
  function handleAccountsChanged(accounts) {
    console.log("Accounts changed:", accounts);
    setTimeout(() => {
      // TODO: Update state with these accounts and add loading state
      window.location.reload();
      console.log("Updated connected accounts");
    }, 500);
  }
  
  function handleChainChanged(chainId) {
    console.log("Chain changed:", chainId);
    console.log("Reloading page");
    // TODO: Add loading state
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

return <></>;

}

export default Ethereum;
