import React from "react";
import { getUnixTimestamp } from "../modules/utils";

import VoteButton from "./VoteButton";

function Proposal(props) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const unixTimestamp = getUnixTimestamp();
    if (props.dateClosed >= unixTimestamp) {
      setOpen(true);
    }
  }, []);

  function renderStatus() {
    if (props.status == 0) {
      if (!open) {
        return "Closed";
      } else {
        return "Open";
      }
    } else if (props.status == 1) {
      return "Accepted";
    } else if (props.status == 2) {
      return "Rejected";
    } else {
      return "Error";
    }
  }

  return (
    <>
      <h1>Proposal {props.id}</h1>
      <h2>Status: {renderStatus()}</h2>
      <h2>Description: <a href={props.link}>{props.link}</a></h2>
      {open && <VoteButton proposalId={props.id} />}
    </>
  );
}

export default Proposal;
