import { Command, CommandOption, Bot } from "../classes/Bot";
import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    PermissionResolvable,
    PermissionsBitField
} from "discord.js";
import DB from "../classes/DB";

export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ ephemeral: interaction.options.getBoolean("ephemeral") ?? true});
        let user = interaction.options.get("user")!;
        await DB.resetUserUsage(user.user!.id, interaction.guild!.id, interaction.options.getBoolean("dupes") ?? false);
        await interaction.editReply(`Success! Reset user ${interaction.options.getUser("user")?.tag} \nI reset their usage count${interaction.options.getBoolean("dupes") ? ", and their dupes." : "only."}`);
    }

    override name(): string {
        return "reset";
    }

    override description(): string {
        return "Reset a user's usage count";
    }

    override options(): CommandOption[] {
        return [
            {
                type: ApplicationCommandOptionType.User,
                name: "user",
                description: "User to reset",
                required: true
            },
            {
                type: ApplicationCommandOptionType.Boolean,
                name: "dupes",
                description: "Allow the user to receive the same domains again.",
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

    override permissions(): PermissionResolvable[] {
        return [PermissionsBitField.Flags.ManageGuild];
    }
}