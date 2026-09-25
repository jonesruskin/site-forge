#!/usr/bin/env node
import { runMain } from "citty";

import { create } from "../commands/create";
import { guard } from "../commands/guard";
import { CLI_VERSION } from "../version";

runMain(
  guard({
    ...create,
    meta: {
      name: "create-site",
      version: CLI_VERSION,
      description: "Create a new site from the site-forge registry",
    },
  }),
);
