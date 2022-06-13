const { SlashCommandBuilder } = require('@discordjs/builders')
const { Domains } = require('../db')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Add a domain to the database')
        .addStringOption(option => option.setName('domain').setDescription('The domain to add')),
    ownerOnly: true,

    async execute(interaction, client) {


        const domainName = interaction.options.getString('domain');
        try {
            const domain = await Domains.findOne({
                where: {
                    name: domainName
                }
            })
            if (domain) return interaction.reply('That domain already exists!')
            await Domains.create({
                name: domainName
            })

            console.log(client.colors.info('[DB]'), `Domain ${domainName} added to db by ${interaction.user.tag}`)
            return interaction.reply({ content: `Domain ${domainName} added`, ephemeral: true })
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return interaction.reply('That domain has already been added!')
            }
            console.log(client.colors.error('[DB]'), "An error occurred while adding a domain to the database: " + client.colors.error(error))
            return interaction.reply('An unknown error occurred. Check the log!')

        }
    }
}