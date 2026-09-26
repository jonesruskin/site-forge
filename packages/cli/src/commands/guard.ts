import * as p from "@clack/prompts";
import type { CommandDef } from "citty";

import { CliError } from "../utils/errors";
import { pc } from "../utils/log";

/* eslint-disable @typescript-eslint/no-explicit-any -- citty's generic arg types */

/** Prints expected errors cleanly (no stack) and exits non-zero. */
export function guard<T extends CommandDef<any>>(command: T): T {
  const run = command.run;
  if (!run) return command;
  return {
    ...command,
    async run(context: any) {
      try {
        await run(context);
      } catch (error) {
        if (error instanceof CliError) {
          p.log.error(error.message);
          if (error.hint) p.log.message(pc.dim(error.hint));
        } else {
          p.log.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
        }
        process.exit(1);
      }
    },
  } as T;
}
