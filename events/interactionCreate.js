const { Domains, Users } = require('../db')

const { dispense, modalHandler, extractModalData } = require('../Handler')
module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            if (command.ownerOnly) {
                if (!client.config.ownerID.includes(interaction.user.id)) {
                    return interaction.reply({
                        content: "Access denied.",
                        ephemeral: true,
                    });
                }
            }
            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        } else if (interaction.isButton()) {
            switch (interaction.customId) {
                case "neb-btn":
                    dispense(client, interaction)
                    break;
                case "report-btn":
                    modalHandler(interaction, client)
                    break;


            }
        } else if (interaction.isModalSubmit()) {
            if (interaction.customId === 'report-modal') {
                extractModalData(interaction, client)
            };
        }
    }
}

