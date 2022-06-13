const { Domains, Users } = require('../db')

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {


        client.user.setActivity(client.config.status, {
            type: "WATCHING",
            name: "work"
        });

        console.log(client.colors.info('[BOT]'), `${client.user.tag} is ready and in ${client.guilds.cache.size} servers with ${client.users.cache.size} users`);
        Domains.sync();
        console.log(client.colors.info('[DB]'), 'Domains synced!')
        Users.sync();
        console.log(client.colors.info('[DB]'), 'Users synced!')
    }
};