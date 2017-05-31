#!/usr/bin/env node
let progress = require('progress')

console.log(process.argv)

require('commander')
  .version(require('./package.json').version)
  .usage('<command> [options]')
  .command('search', 'search the novel name')
  .command('list', 'list the chapters by the name of novel')
  .command('download', 'download the novel')
  .parse(process.argv)

