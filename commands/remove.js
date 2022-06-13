const { SlashCommandBuilder } = require('@discordjs/builders')
const { Domains } = require('../db')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('remove')
        .addStringOption(option => option.setName('domain').setDescription('The domain to delete')),
    ownerOnly: true,

    async execute(interaction) {
        const domainName = interaction.options.getString('domain');
        try {
            await Domains.destroy({
                where: {
                    name: domainName
                }
            }).catch(err => {
                console.log(err)
                return interaction.reply('An unknown error occurred. Check the log!')
            })
            return interaction.reply({ content: `Domain ${domainName} removed`, ephemeral: true })

        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return interaction.reply('That domain has already been added!')
            }
            return interaction.reply('An unknown error occurred. Check the log!')

        }
    }
}