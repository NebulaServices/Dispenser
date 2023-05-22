import {ContextMenu, Bot, CommandPermissions} from "../classes/Bot";
import {
    MessageContextMenuCommandInteraction,
    ContextMenuCommandType,
    ApplicationCommandType, PermissionsBitField,
} from "discord.js";
import DB from "../classes/DB";

export default class extends ContextMenu {
    override async run(interaction: MessageContextMenuCommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ephemeral: true});
        await DB.unbanUser(interaction.targetId, interaction.guildId!);
        await interaction.editReply(`Success! Unbanned user <@${interaction.targetId}>`);
    }

    override name(): string {
        return "Unban User";
    }

    override type(): ContextMenuCommandType {
        return ApplicationCommandType.User
    }

    override permissions(): CommandPermissions {
        return {
            permissions: PermissionsBitField.Flags.BanMembers,
            dmUsable: false,
        }
    }
}