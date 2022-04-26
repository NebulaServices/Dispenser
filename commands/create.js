const Database = require("@replit/database")

const owners = ['745058406083198994', '366312087317774336', '366312087317774336', '959055360218517584'];

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
  data:
    new SlashCommandBuilder()
      .setName('create')
      .setDescription('Creates the selection embed'),
  async handle(interaction) {
    const domain = interaction.options.getString('domain');

    const embed = {
      color: 0x5a189a,
      title: 'Selection',
      description: 'Choose a proxy site'
    };

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('nebula')
        .setLabel('Nebula')
        .setStyle('PRIMARY')
    );
    
  	if (owners.includes(interaction.user.id)) {
  		await interaction.reply({
        embeds: [embed],
        components: [row]
      });
    }
  }
};
