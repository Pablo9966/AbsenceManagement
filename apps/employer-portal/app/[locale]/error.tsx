"use client";

import { ErrorState } from "../../src/frontend.js";

export default function EmployerPortalError(props: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <ErrorState title="Employer workflow error" message={props.error.message} />
      <button className="btn-primary" onClick={() => props.reset()}>Retry</button>
    </div>
  );
}
