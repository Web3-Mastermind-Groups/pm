import React from "react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  CloseButton,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage
} from "@chakra-ui/core";
import { Formik, Field } from "formik";
import web3 from "web3";

import Context from "../context";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function ProposalForm() {
  const state = React.useContext(Context);
  const [created, setCreated] = React.useState(false);
  const [txHash, setTxHash] = React.useState(null);
  const [failed, setFailed] = React.useState(false);
  const [failureMessage, setFailureMessage] = React.useState(null);

  function validateAmount(value) {
    let error;
    if (!/^[0-9]*$/.test(value)) {
      error = "Must be an integer";
    } if (/^0+/.test(value) && (value.length > 1)) {
      error = "No leading zeros";
    }
    return error;
  }

  function validateLink(value) {
    let error;
    if (!value) {
      error = "Link to proposal description is required";
    } else if (!value.startsWith("ipfs")) {
      error = "Must be an ipfs uri";
    }
    return error;
  }

  function validateRecipient(value) {
    let error;
    if (!web3.utils.isAddress(value)) {
      error = "Must be an Ethereum address";
    }
    return error;
  }

  async function onSubmit(values, actions) {
    const [error, receipt] = await state.createReferendaProposal(values.link, values.amount, values.recipient);
    console.log(receipt);
    actions.setSubmitting(false);
    if (error) {
      setFailed(true);
      setFailureMessage(error);
    } else {
      setCreated(true);
      setTxHash(receipt.transactionHash);
    }
  }

  function renderFailureMessage() {
    return (
<Alert status="error">
  <AlertIcon />
  <AlertTitle mr={2}>Failed to submit!</AlertTitle>
    <AlertDescription>{failureMessage}</AlertDescription>
  <CloseButton position="absolute" right="8px" top="8px" />
</Alert>
    );
  }

  function renderSuccessMessage() {
    return (
      <Alert status="success">
    <AlertIcon />
  <AlertTitle mr={2}>Proposal created!</AlertTitle>
    <AlertDescription>Transaction hash {txHash}</AlertDescription>
  </Alert>
    );
  }

  return (
    <>
      <div>Create a proposal in Referenda {process.env.REACT_APP_ETH_LOCAL_REFERENDA_ADDRESS}</div>
      {failed && renderFailureMessage()}
      {created && renderSuccessMessage()}
      {!created && (

      <Formik
        initialValues={{ amount: "0", link: "", recipient: ZERO_ADDRESS }}
        onSubmit={onSubmit}
      >
        {props => (
          <form onSubmit={(e) => {
            e.preventDefault();
            props.handleSubmit();
          }}>
            <Field name="link" validate={validateLink}>
              {({ field, form }) => (
                <FormControl isInvalid={form.errors.link && form.touched.link}>
                  <FormLabel htmlFor="url">Link</FormLabel>
                  <Input {...field} id="link" placeholder="link" />
                  <FormErrorMessage>{form.errors.link}</FormErrorMessage>
                </FormControl>
              )}
            </Field>
            <Field name="amount" validate={validateAmount}>
              {({ field, form }) => (
                <FormControl isInvalid={form.errors.amount && form.touched.amount}>
                  <FormLabel htmlFor="input">Payout Amount</FormLabel>
                  <Input {...field} id="amount" placeholder="amount" />
                  <FormErrorMessage>{form.errors.amount}</FormErrorMessage>
                </FormControl>
              )}
            </Field>
            <Field name="recipient" validate={validateRecipient}>
              {({ field, form }) => (
                <FormControl isInvalid={form.errors.recipient && form.touched.recipient}>
                  <FormLabel htmlFor="input">Payout Recipient</FormLabel>
                  <Input {...field} id="recipient" placeholder="recipient" />
                  <FormErrorMessage>{form.errors.recipient}</FormErrorMessage>
                </FormControl>
              )}
            </Field>
            <Button
              mt={4}
              variantColor="teal"
              isLoading={props.isSubmitting}
              type="submit"
            >
              Submit
            </Button>
          </form>
        )}
      </Formik>
      )}
    </>
  );
}

export default ProposalForm;