// © Nebula Services Development 2021-2022
// Unauthorized use or distribution of this code is strictly prohibited. 

const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Intents, Collection } = require('discord.js');

require('dotenv').config();
const token = process.env.token;

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const rest = new REST({ version: '9' }).setToken(token);

let commandsData = [];
let commands = new Collection();

const fs = require('fs');
const files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (file of files) {
  const command = require(`./commands/${file}`);
  commandsData.push(command.data.toJSON());
  commands.set(command.data.name, command);
}

rest.put(Routes.applicationGuildCommands('967491996434448456', '893257531810521108'), { body: commandsData })

client.once('ready', () => {
	console.log('Ready!');

  client.user.setActivity('Nebula Services', {
		type: 'WATCHING'
	})
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand())
    return;

  const command = commands.get(interaction.commandName);

  if (!command)
    return;

  try {
    await command.handle(interaction);
  } catch (error) {
    console.error(error)
  }
});

const Database = require('@replit/database');

const db = new Database();

const { blocked } = require('./ls.js');

client.on('interactionCreate', interaction => {
	if (!interaction.isButton())
    return;

  const id = interaction.user.id;

  db.get('domain').then(domains => {
    db.get(id).then(async value => {
      if (value === null)
        value = {
          times: 0,
          domains: []
        };
      
      if (value.times >= 1) {
        interaction.reply({ content: 'You can only get one link a month\nMake a ticket if you need a new link', ephemeral: true });
        return;
      }
      
      let domainFound = false;

      do {
        if (domains === null || domains.length === 0) {
          interaction.reply({ content: 'There are no more links to give to you', ephemeral: true });
          return;
        }
        
        var domain = domains[Math.floor(Math.random() * domains.length)];

        const isBlocked = await blocked(domain);

        if (!isBlocked && !value.domains.includes(domain)) {
          domainFound = true;
            
          value.times++;
          value.domains.push(domain);

          // Save
          db.set(id, value);

          const embed = {
            color: 0x5a189a,
            description: `Thank you for using Nebula\nhttps://${domain}`,
            footer:{ text: (1 - value.times) === 0 ? 'No more links' : (3 - value.times) === 1 ? '1 more link remaining' : `${1 - value.times} more links remaining` } 
          };

          interaction.reply({ content: 'Check your DMs', ephemeral: true });

          interaction.user.send({ embeds: [embed] });
        } else {
          domains = domains.filter(x => x !== domain);
        }
  
      } while (!domainFound);
    });
  });
});



client.login(token); 