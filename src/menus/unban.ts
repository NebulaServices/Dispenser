import { MessageMenu, Bot} from "../classes/Bot";
import {
    MessageContextMenuCommandInteraction,
    ContextMenuCommandType,
    ApplicationCommandType,
} from "discord.js";
import DB from "../classes/DB";

export default class extends MessageMenu {
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
}