const chalk = require('chalk')

const colors = {
    info: chalk.bold.blue,
    warn: chalk.bold.yellow,
    error: chalk.bold.red,
    success: chalk.bold.green,
    bold: chalk.bold.bold,
    debug: chalk.bold.gray,
}

module.exports = { colors }
