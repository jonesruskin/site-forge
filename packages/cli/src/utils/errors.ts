/** An expected failure with a message meant for the user (no stack trace). */
export class CliError extends Error {
  constructor(
    message: string,
    readonly hint?: string,
  ) {
    super(message);
    this.name = "CliError";
  }
}
