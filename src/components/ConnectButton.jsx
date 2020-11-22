import React from "react";
import { Button } from "@chakra-ui/core";

import Context from "../context";

function ConnectButton() {
    const state = React.useContext(Context);
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(stopLoadingWhenConnected, [state]);
    function stopLoadingWhenConnected() {
      if (state.ethereumConnected) {
        setLoading(false);
      }
    }

    async function handleConnect() {
      setError(null);
      state.setStartEthereum(true);
      setLoading(true);
    }

    function renderAccounts(accounts) {
      return accounts.map((account) => {
        return <div key={account}>{account}</div>;
      });
    }

    return (
      <div>
        {error && <div>{error}</div>}
        {!state.ethereumConnected && (
          <Button isLoading={loading} variantColor="green" onClick={handleConnect}>
            Connect
          </Button>
        )}
        {state.ethereumConnected && (
          <div>
            <div>Connected accounts:</div>
            {renderAccounts(state.ethereumAccounts)}
          </div>
        )}
      </div>
    );
}

export default ConnectButton;
