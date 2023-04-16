import { Command, CommandOption, Bot } from "../classes/Bot";
import {ApplicationCommandOptionType, CommandInteraction} from "discord.js";
import DB from "../classes/DB";


export default class extends Command {
    override async run(interaction: CommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ephemeral: true});
        let regex = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
        if (!regex.test(interaction.options.get("domain")!.value as string)) {
            await interaction.editReply(`That is an invalid URL.`);
            return;
        }
        await DB.addDomain(interaction.guildId!, interaction.options.get("domain")!.value as string, interaction.user.id);
        await interaction.editReply(`Ok! Added ${interaction.options.get("domain")!.value as string} to the database.`);
    }

    override name(): string {
        return "add";
    }

    override description(): string {
        return "Add a domain to the db";
    }

    override options(): CommandOption[] {
        return [{
            name: "domain",
            description: "The domain to add",
            type: ApplicationCommandOptionType.String,
            required: true
        }]
    }
}