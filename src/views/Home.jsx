import React from "react";
import Proposal from "../components/Proposal";
import ProposalForm from "../components/ProposalForm";

function Home() {
  const proposals = [{id: 1}];

  function renderProposals() {
    return proposals.map((prop) => {
      return <Proposal key={prop.id} {...prop} />;
    });
  }

  return (
    <div>
      <ProposalForm />
      {renderProposals()}
    </div>
  );
}

export default Home;
