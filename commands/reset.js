const Database = require('@replit/database');

const db = new Database();

const owners = ['745058406083198994', '366312087317774336', '366312087317774336'];

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data:
    new SlashCommandBuilder()
      .setName('clear')
      .setDescription('Resets the database'),
  async handle(interaction) {
  	if (owners.includes(interaction.user.id)) {
      db.empty();
      await interaction.reply({ content: 'Done', ephemeral: true });
    }
  }
};