import React from "react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  CloseButton,
  Radio,
  RadioGroup
} from "@chakra-ui/core";
import Web3 from "web3";

import Context from "../context";

function VoteButton(props) {
  const state = React.useContext(Context);
  const [selection, setSelection] = React.useState(null);
  const [acceptsProposal, setAcceptsProposal] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [voteHash, setVoteHash] = React.useState(null);
  const [txHash, setTxHash] = React.useState(null);
  const [failed, setFailed] = React.useState(false);
  const [failureMessage, setFailureMessage] = React.useState(null);

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
    const voteType = acceptsProposal && 1 || 2;
    const [generatedVoteHash] = await state.generateVoteHash(Web3.utils.toBN(props.proposalId), voteType);
    const [error, receipt] = await state.vote(Web3.utils.toBN(props.proposalId), generatedVoteHash);
    console.log(receipt);
    setSubmitting(false);
    if (error) {
      setFailed(true);
      setFailureMessage(error);
    } else {
      setVoteHash(generatedVoteHash);
      setTxHash(receipt.transactionHash);
    }
  }

  function renderFailureMessage() {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle mr={2}>Transaction failed!</AlertTitle>
        <AlertDescription>{failureMessage}</AlertDescription>
        <CloseButton position="absolute" right="8px" top="8px" />
      </Alert>
    );
  }

  function renderSuccessMessage() {
    return (
      <Alert status="success">
        <AlertIcon />
        <AlertTitle mr={2}>You voted!</AlertTitle>
        <AlertDescription>
          <div>Transaction hash: {txHash}</div>
          <div>Vote hash: {voteHash}</div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      {!voteHash && (
        <RadioGroup onChange={handleSelect} value={selection}>
          <Radio value="accept">Accept</Radio>
          <Radio value="reject">Reject</Radio>
        </RadioGroup>
      )}
      {selection && !voteHash && (
        <Button isLoading={submitting} variantColor="green" onClick={handleConfirm}>
          Confirm vote to {selection} proposal {props.proposalId}
        </Button>
      )}
      {failed && renderFailureMessage()}
      {voteHash && renderSuccessMessage()}
    </div>
  );
}

export default VoteButton;
