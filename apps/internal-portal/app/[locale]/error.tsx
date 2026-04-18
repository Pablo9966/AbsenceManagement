"use client";

import { ErrorState } from "../../src/frontend.js";

export default function InternalPortalError(props: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <ErrorState title="Internal workflow error" message={props.error.message} />
      <button className="btn-primary" onClick={() => props.reset()}>Retry</button>
    </div>
  );
}
