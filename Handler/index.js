const { Domains, Users } = require('../db')
const { MessageActionRow, Modal, TextInputComponent, WebhookClient, MessageEmbed } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const dispense = async (client, interaction) => {
    const user = await Users.findOne({ where: { id: interaction.user.id } })

    // adding user to local db (so very fun and cool coding!!!!!!!!)
    try {
        if (!user) {
            await Users.create({
                id: interaction.user.id,
                usage_count: 0
            })
            console.log(client.colors.warn('[DB]'), `User ${interaction.user.tag} added to db`)
            return interaction.reply({ content: 'You have been added to the database - click the button again.', ephemeral: true })
        }
    } catch (err) {
        console.log(client.colors.error(err))
    }
    const usage = user.usage_count;

    // Checking if the users usage count is greater or equal to 3
    if (usage >= 3) return interaction.reply({ content: 'You\'ve already used your 3 requests for the month. Try again next month.', ephemeral: true })

    // There is probably a better way to do this, but this is all im doin rn
    const domainList = await Domains.findAll({ attributes: ['name'] })
    const domainlistString = domainList.map(domain => domain.name).join(', ') || "[empty array]"
    const domainarray = domainlistString.split(', ')
    const randomDomain = domainarray[Math.floor(Math.random() * domainarray.length)]

    const domainEmbed = new MessageEmbed()
        .setColor('#4000ff')
        .setTitle('Proxy Request')
        .setDescription(`Enjoy your site!`)
        .addField('Domain', `${randomDomain}`)
        .addField(`Remaining uses`, `${2 - usage}`)

    try{
        await interaction.user.send({ embeds: [domainEmbed] })
        await interaction.reply({content: 'Check your DMs.', ephemeral: true})
    } catch(error){return interaction.reply({content: 'Couldn\'t DM you the proxy. Enable your DMs and try again.', ephemeral: true});}
    try {
        await Users.increment({
            usage_count: 1
        }, {
            where: {
                id: interaction.user.id
            }
        })
    } catch (error) {
        if (error.name === 'SequelizeDatabaseError') { return; } // sqlite being dumb lmao
    }

}


const modalHandler = async (interaction, client) => {
    const modal = new Modal()
        .setCustomId('report-modal')
        .setTitle('Report a domain');

    const domainText = new TextInputComponent()
        .setCustomId('domainInput')
        .setLabel("The domain to report")
        .setStyle('SHORT');

    const blockerText = new TextInputComponent()
        .setCustomId('blockerInput')
        .setLabel("The filter you have")
        .setStyle('SHORT');

    const domainRow = new MessageActionRow().addComponents(domainText);
    const blockerRow = new MessageActionRow().addComponents(blockerText);
    modal.addComponents(domainRow, blockerRow);
    await interaction.showModal(modal);

}


const extractModalData = async (interaction, client) => {
    const webhookurl = client.config.reportWebhook

    const webhookClient = new WebhookClient({ url: webhookurl })
    const domain = interaction.fields.getTextInputValue('domainInput')
    const blocker = interaction.fields.getTextInputValue('blockerInput').toLowerCase()
    const blockers = ["lightspeed", "ls", "light speed", "goguardian", "gg", "iboss", "ib", "content keeper", "ck", "securly", "cisco"]
    if (!domain || !blocker) {
        return interaction.reply({ content: 'Please fill out all fields!', ephemeral: true })
    }
    // check if the domain is valid with regex
    if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/.test(domain)) {
        return interaction.reply({ content: 'Please enter a valid domain!', ephemeral: true })
    }
    if (!blockers.includes(blocker)) {
        return interaction.reply({ content: `Please enter a valid filter!\nValid filters: \`${blockers}\`.\nIf your filter is not listed, create a ticket or contact a staff member.`, ephemeral: true })
    }

    const reportEmbed = new client.Discord.MessageEmbed()
        .setColor('#4000ff')
        .setTitle('Domain Reported')
        .setDescription(`Domain \`${domain}\` has been reported by ${interaction.user.tag}`)
        .addField('Domain', `${domain}`)
        .addField('Filter', `${blocker}`)
        .setFooter({ text: `ID: ${interaction.user.id}` });

    try {
        webhookClient.send({
            username: client.config.reportUsername,
            avatarURL: client.config.reportAvatar,
            embeds: [reportEmbed],
        });
        await interaction.reply({ content: 'Your report has been sent!', ephemeral: true })
    } catch (error) {
        console.error(error)
        return interaction.reply({ content: 'There was an error while submiting your response!!', ephemeral: true })
    }
}


const loadEvents = (client, eventsPath) => {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
            console.log(client.colors.success("[EVENT]"), `${event.name} loaded successfully.`);
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
            console.log(client.colors.success("[EVENT]"), `${event.name} loaded successfully`);
        }
    }

}

const loadCommands = (client, commandsPath) => {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        client.commands.set(command.data.name, command);
        console.log(client.colors.warn("[COMMAND]"), `${command.data.name}.js loaded successfully.`);
    }
}


module.exports = {
    loadEvents,
    loadCommands,
    dispense,
    modalHandler,
    extractModalData
}