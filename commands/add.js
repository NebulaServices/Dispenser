const Database = require('@replit/database');

const db = new Database();

const owners = ['745058406083198994', '366312087317774336', '366312087317774336'];

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data:
    new SlashCommandBuilder()
      .setName('add')
      .setDescription('Adds a new domain')
      .addStringOption(option =>
        option
          .setName('domain')
          .setDescription('Domain to add')
          .setRequired(true)),
  async handle(interaction) {
    const domain = interaction.options.getString('domain');

  	if (owners.includes(interaction.user.id)) {
      db.get('domain').then(value => {
        if (value === null)
          value = [];
        
        value[value.length] = domain;
        
        db.set('domain', value);
      });
      await interaction.reply({ content: `Added ${domain}`, ephemeral: true });
    }
  }
};