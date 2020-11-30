import React from "react";
import { Button } from "@chakra-ui/core";
import Proposal from "./Proposal";
import Context from "../context";
import { getProposals } from "../modules/ethereum";

function ProposalList() {
  const state = React.useContext(Context);
  const [proposals, setProposals] = React.useState([]);
  const [refresh, setRefresh] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(async () => {
    if (refresh) {
      const nextProposals = await getProposals(state.referenda);
      setProposals(nextProposals);
      setRefresh(false);
      setLoading(false);
    }
  }, [refresh]);


  function renderProposals() {
    return proposals.map((prop) => {
      return <Proposal key={prop.id} {...prop} />;
    });
  }

  function handleRefresh() {
    setLoading(true);
    setRefresh(true);
  }

  return (
    <div>
      <h1>Proposals</h1>
      <Button isLoading={loading} onClick={handleRefresh} rightIcon="repeat" colorScheme="blue" variant="outline">
        Refresh
      </Button>
      {renderProposals()}
    </div>
  );
}

export default ProposalList;
