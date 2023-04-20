import { Command, CommandOption, Bot } from "../classes/Bot";
import {ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import DB from "../classes/DB";


export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ephemeral: true});
        let regex = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
        if (!regex.test(interaction.options.get("domain")!.value as string)) {
            await interaction.editReply(`That is an invalid URL.`);
            return;
        }
        await DB.addDomain(interaction.guildId!, interaction.options.getString("domain")!, interaction.user.id);
        await interaction.editReply(`Ok! Added ${interaction.options.getString("domain")} to the database.`);
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