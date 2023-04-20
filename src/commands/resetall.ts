import { Command, CommandOption, Bot } from "../classes/Bot";
import { ApplicationCommandOptionType, ChatInputCommandInteraction} from "discord.js";
import DB from "../classes/DB";

export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ephemeral: interaction.options.getBoolean("ephemeral") ?? true});
        await DB.resetAll(interaction.guild!.id, interaction.options.getBoolean("dupes") ?? false);
        await interaction.editReply(`Success! Reset all users. \nI reset their usage count${interaction.options.getBoolean("dupes") ? ", and reset their dupes." : " only."}`);
    }

    override name(): string {
        return "resetall";
    }

    override description(): string {
        return "Reset every user in the DB.";
    }

    override options(): CommandOption[] {
        return [
            {
                type: ApplicationCommandOptionType.Boolean,
                name: "dupes",
                description: "Allow the users to receive the same domains again.",
                required: false
            },
            {
                type: ApplicationCommandOptionType.Boolean,
                name: "ephemeral",
                description: "Whether the response should be ephemeral or not.",
                required: false
            }
        ];
    }
}