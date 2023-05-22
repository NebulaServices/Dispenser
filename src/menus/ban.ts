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
        try {
            await DB.banUser(interaction.targetId, interaction.guildId!);
        } catch (e) {
            await interaction.editReply(`Failed to ban user: ${e}`);
            return;
        }

        await interaction.editReply(`Success! Banned user <@${interaction.targetId}>`);
    }

    override name(): string {
        return "Ban User";
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