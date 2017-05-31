let chalk = require('chalk')
let format = require('util').format

let prefix = ' imooc-cli'
let sep = chalk.gray('·')

exports.log = function () {
  let msg = format.apply(format, arguments)
  console.log(chalk.white(prefix), sep, msg)
}

exports.error = function (message) {
  if (message instanceof Error) message = message.message.trim()
  let msg = format.apply(format, arguments)
  console.error(chalk.red(prefix), sep, msg)
  process.exit(1)
}

exports.success = function () {
  let msg = format.apply(format, arguments)
  console.log(chalk.white(prefix), sep, msg)
}