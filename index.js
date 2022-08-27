require("dotenv").config();
const { Client, Collection, Intents } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { colors } = require('./colors');
const deployCommands = require('./deploy-commands');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const Discord = require('discord.js');
const { loadEvents, loadCommands } = require('./Handler');

// global sexy variables
module.exports = client;
client.config = process.env;
client.Discord = Discord;
client.commands = new Collection();
client.colors = colors;
// epic console.log moment
console.log(client.colors.error("Loading files..."))
// loading mega sexy commands and events
loadEvents(client, path.join(__dirname, 'events'));
loadCommands(client, path.join(__dirname, 'commands'))

// logging in to bot
client.login(client.config.TOKEN);
