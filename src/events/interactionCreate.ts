import { RunEvent } from '../interfaces/Event';
import Bot from '../classes/Bot';
import { Interaction, InteractionType } from 'discord.js';

const run: RunEvent = async (client: Bot, interaction: Interaction): Promise<any> => {
    switch (interaction.type) {
        case InteractionType.ApplicationCommand: {
            const command = client.commands.get(interaction.commandName);
            if (command) await command.run(client, interaction);
        } break;
    }
}

export { run };