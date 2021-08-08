#!/usr/bin/env node

const args = process.argv.splice(2);

const options = {
  directory: args[1],
}

switch (args[0]) {
  case "test":
    require('../src/test').test(options)
    break
}

