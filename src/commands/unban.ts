import { Command, CommandOption, Bot } from "../classes/Bot";
import {ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionResolvable, PermissionsBitField} from "discord.js";
import DB from "../classes/DB";

export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ ephemeral: interaction.options.getBoolean("ephemeral") ?? true });
        await DB.unbanUser(interaction.options.getUser("user")!.id, interaction.guildId!);
        await interaction.editReply(`Success! Unbanned user <@${interaction.options.getUser("user")?.id}> (${interaction.options.getUser("user")?.tag})`);
    }

    override name(): string {
        return "unban";
    }

    override description(): string {
        return "Unban a user from the bot.";
    }

    override options(): CommandOption[] {
        return [{
            name: "user",
            description: "The user to unban",
            type: ApplicationCommandOptionType.User,
            required: true
        },
            {
                name: "ephemeral",
                description: "Whether the response should be ephemeral or not.",
                type: ApplicationCommandOptionType.Boolean,
                required: false
            }];
    }
    override permissions(): PermissionResolvable[] {
        return [PermissionsBitField.Flags.ManageGuild];
    }
}