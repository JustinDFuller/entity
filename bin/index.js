#!/usr/bin/env node

import { entity } from '../src/index.js';

const args = process.argv.splice(2);

const options = {
  directory: args[1],
}

switch (args[0]) {
  case "test":
    entity.test(options)
    break
}

