export class WorkflowNotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "WorkflowNotFoundError";
  }
}

export class WorkflowForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "WorkflowForbiddenError";
  }
}
