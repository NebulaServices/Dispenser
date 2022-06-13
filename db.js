const { Sequelize } = require('sequelize')
const fs = require('node:fs')
const { colors } = require('./colors')
if (!fs.existsSync('./database.sqlite')) {
    fs.openSync('./database.sqlite', 'w')
    console.log(colors.info('[DB]'), 'Database created!')
}


const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite'
})
const Domains = sequelize.define('domains', {
    name: {
        type: Sequelize.STRING,
        unique: true,
    },
})
const Users = sequelize.define('users', {
    id: {
        type: Sequelize.STRING,
        unique: true,
        primaryKey: true,
    },
    usage_count: {
        type: Sequelize.INTEGER,
        defaultValue: 3,
        allowNull: false,
    },
})


module.exports = {
    Domains,
    Users
}