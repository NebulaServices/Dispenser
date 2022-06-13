const { SlashCommandBuilder } = require('@discordjs/builders')

const { Domains } = require('../db')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('List all domains in the database'),
    ownerOnly: true,

    async execute(interaction, client) {



        const domainList = await Domains.findAll({ attributes: ['name'] }) || "No domains found"
        const domainListString = domainList.map(domain => domain.name).join(', ') || "No domains found"

        const domainEmbed = new client.Discord.MessageEmbed()
            .setColor('#4000ff')
            .setTitle('Domains')
            .setDescription('Here are all the domains in the database')
            .addFields(
                { name: 'Domains', value: domainListString, inline: true },
            )

            .setTimestamp()



        return interaction.reply({ embeds: [domainEmbed] })
    }
}
