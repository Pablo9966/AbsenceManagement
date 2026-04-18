import { LoadingState } from "../../src/frontend.js";

export default function InternalPortalLoading() {
  return <LoadingState title="Loading internal workflow" message="Preparing intake, case, and benefit data." />;
}
