#!/usr/bin/env node

const program = require('commander')
const colors = require('colors')
 
program
  .version(require('./package.json').version)
  .command('search <courseName>')
  .description('Search course specified by keywords')
  .action(function (courseName, options) {
    console.log('search for %s', courseName)
  })
  .on('--help', function () {
    console.log('search help')
  })
 
program.parse(process.argv);
 