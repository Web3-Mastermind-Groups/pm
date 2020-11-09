import React from "react";
import { Button, Radio, RadioGroup } from "@chakra-ui/core";

function VoteButton(props) {
    const [selection, setSelection] = React.useState(null);
    const [submitting, setSubmitting] = React.useState(false);

    function handleSelect(e) {
      setSelection(e.target.value);
    }

    function handleConfirm() {
      setSubmitting(true);
    }

    return (
      <div>
        <RadioGroup onChange={handleSelect} value={selection}>
          <Radio value="accept">Accept</Radio>
          <Radio value="reject">Reject</Radio>
        </RadioGroup>
        {selection &&(
          <Button isLoading={submitting} variantColor="green" onClick={handleConfirm}>
            Confirm vote to {selection} proposal {props.proposalId}
          </Button>
        )}
      </div>
    );
}

export default VoteButton;
