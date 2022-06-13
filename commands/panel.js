const Discord = require("discord.js");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")

const { SlashCommandBuilder } = require('@discordjs/builders')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Create a panel of buttons'),
    ownerOnly: true,
    async execute(interaction, client) {




        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setLabel("🪐 - Nebula")
                .setCustomId("neb-btn")
                .setStyle("PRIMARY")
                .setDisabled(false),
            new MessageButton()
                .setLabel("⚠️ - Report")
                .setCustomId("report-btn")
                .setStyle("DANGER")
                .setDisabled(false),
        );

        // Embed
        const proxyEmbed = new MessageEmbed()
            .setTitle("Proxy Dispenser")
            .setDescription(`Choose the proxy you want below or report a blocked one.`)
            .setColor("#4000ff")
            .setFooter({ text: `${client.config.embedfooterText}`, iconURL: `${client.user.displayAvatarURL()}` });

        await interaction.reply({ embeds: [proxyEmbed], components: [row] });
    }
}