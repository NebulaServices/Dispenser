require("dotenv").config();
const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const clientID = process.env.CLIENTID;
const guildID = process.env.guildID;
const token = process.env.TOKEN;
const { colors } = require('./colors');
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientID, guildID), { body: commands })
    .then(() => console.log(colors.debug('[Commands]'), 'Successfully registered application commands.'))
    .catch(console.error);