import React from "react";
import { Button } from "@chakra-ui/core";

import { connect } from "../modules/ethereum";

function ConnectButton() {
    const [connecting, setConnecting] = React.useState(false);
    const [connected, setConnected] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [accounts, setAccounts] = React.useState([]);

    async function handleConnect() {
      setError(null);
      setConnecting(true);
      try {
        const connectedAccounts = await connect();
        setAccounts(connectedAccounts);
      } catch(err) {
        setError(err);
      }
      setConnected(true);
      setConnecting(false);
    }

    function renderAccounts() {
      return accounts.map((account) => {
        return <div key={account}>{account}</div>;
      });
    }

    return (
      <div>
        {error && <div>{error}</div>}
        {!connected && (
          <Button isLoading={connecting} variantColor="green" onClick={handleConnect}>
            Connect
          </Button>
        )}
        {connected && (
          <div>
            <div>Connected accounts:</div>
            {renderAccounts()}
          </div>
        )}
      </div>
    );
}

export default ConnectButton;
