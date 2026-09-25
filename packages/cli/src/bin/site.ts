#!/usr/bin/env node
import { defineCommand, runMain } from "citty";

import { add } from "../commands/add";
import { create } from "../commands/create";
import { diff } from "../commands/diff";
import { doctor } from "../commands/doctor";
import { guard } from "../commands/guard";
import { list } from "../commands/list";
import { remove } from "../commands/remove";
import { sync } from "../commands/sync";
import { theme } from "../commands/theme";
import { update } from "../commands/update";
import { CLI_VERSION } from "../version";

const main = defineCommand({
  meta: {
    name: "site",
    version: CLI_VERSION,
    description: "Grow a site-forge project: add, update and remove modules, sections and themes",
  },
  subCommands: {
    create: guard(create),
    add: guard(add),
    remove: guard(remove),
    update: guard(update),
    diff: guard(diff),
    doctor: guard(doctor),
    list: guard(list),
    theme: guard(theme),
    sync: guard(sync),
  },
});

runMain(main);
