import { Command, CommandOption, Bot, CommandPermissions } from "../classes/Bot";
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import DB from "../classes/DB";
import Utils from "../classes/Utils";

export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ ephemeral: interaction.options.getBoolean("ephemeral") ?? true });
        try {
            await DB.unbanUser(interaction.options.getUser("user")!.id, interaction.guildId!);
        } catch (e) {
            await interaction.editReply({ embeds: [ Utils.getEmbed(0xff0000, { title: `Failed to unban user`, description: e!.toString() }) ] });
            return;
        }

        await interaction.editReply({ embeds: [ Utils.getEmbed(0x814fff, { title: `Success!`, description: `Unbanned user <@${interaction.options.getUser("user")?.id}> (${interaction.options.getUser("user")?.tag})`}) ]});
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
    override permissions(): CommandPermissions {
        return {

        }
    }
}