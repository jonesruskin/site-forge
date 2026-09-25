#!/usr/bin/env node
import { defineCommand, runMain } from "citty";

import { add } from "../commands/add";
import { create } from "../commands/create";
import { guard } from "../commands/guard";
import { list } from "../commands/list";
import { sync } from "../commands/sync";
import { theme } from "../commands/theme";
import { CLI_VERSION } from "../version";

const main = defineCommand({
  meta: {
    name: "site",
    version: CLI_VERSION,
    description: "Grow a site-forge project: add modules, sections and themes",
  },
  subCommands: {
    create: guard(create),
    add: guard(add),
    list: guard(list),
    theme: guard(theme),
    sync: guard(sync),
  },
});

runMain(main);
