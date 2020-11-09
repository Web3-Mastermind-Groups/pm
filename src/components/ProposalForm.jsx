import React from "react";
import {
    Button,
    Input,
    FormControl,
    FormLabel,
    FormErrorMessage
  } from "@chakra-ui/core";

import { Formik, Field } from "formik";
import web3 from "web3";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function ProposalForm() {

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
      } else if (!value.startsWith("ipfs") ) {
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

    return (
        <>
        <div>Create a proposal</div>
      <Formik
        initialValues={{ amount: "0", link: "", recipient: ZERO_ADDRESS }}
        onSubmit={(values, actions) => {
          setTimeout(() => {
            alert(JSON.stringify(values, null, 2));
            actions.setSubmitting(false);
          }, 1000);
        }}
      >
        {props => (
          <form onSubmit={props.onSubmit}>
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
      </>
    );
  }

export default ProposalForm;