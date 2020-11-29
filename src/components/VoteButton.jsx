import React from "react";
import { Button, Radio, RadioGroup } from "@chakra-ui/core";

import Context from "../context";

function VoteButton(props) {
  const state = React.useContext(Context);
  const [selection, setSelection] = React.useState(null);
  const [acceptsProposal, setAcceptsProposal] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);

  function handleSelect(e) {
    if (e.target.value === "accept") {
      setAcceptsProposal(true);
    } else {
      setAcceptsProposal(false);
    }
    setSelection(e.target.value);
  }

  async function handleConfirm() {
    setSubmitting(true);
    await state.generateVoteHash(1, acceptsProposal);
  }

  return (
    <div>
      <RadioGroup onChange={handleSelect} value={selection}>
        <Radio value="accept">Accept</Radio>
        <Radio value="reject">Reject</Radio>
      </RadioGroup>
      {selection && (
        <Button isLoading={submitting} variantColor="green" onClick={handleConfirm}>
          Confirm vote to {selection} proposal {props.proposalId}
        </Button>
      )}
    </div>
  );
}

export default VoteButton;
