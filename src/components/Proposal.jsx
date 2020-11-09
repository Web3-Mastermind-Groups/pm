import React from "react";

import VoteButton from "./VoteButton";

function Proposal(props) {
  return (
    <>
      <h1>Proposal Id #{props.id}</h1>
      <div>Vote</div>
      <VoteButton />
    </>
  );
}

export default Proposal;
