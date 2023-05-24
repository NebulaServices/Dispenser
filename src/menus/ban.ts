import {ContextMenu, Bot, CommandPermissions} from "../classes/Bot";
import {
    ContextMenuCommandType,
    ApplicationCommandType, //PermissionsBitField,
     MessageContextMenuCommandInteraction,
} from "discord.js";
import DB from "../classes/DB";
import Utils from "../classes/Utils";

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

        await Utils.sendWebhook(interaction.guildId!, 2, [
            Utils.getEmbed(0x814fff, {
                title: `User Banned`,
                fields: [
                    {
                        name: "User",
                        value: `<@${interaction.targetId}> (${interaction.targetId})`,
                    },
                    {
                        name: "Banned By",
                        value: `<@${interaction.user.id}> (${interaction.user.tag} | ${interaction.user.id})`,
                    },
                    {
                        name: "Ban Method",
                        value: "Context Menu"
                    }
                ]
            })
        ])
    }

    override name(): string {
        return "Ban User";
    }

    override type(): ContextMenuCommandType {
        return ApplicationCommandType.User
    }

    override permissions(): CommandPermissions {
        return {
            //permissions: PermissionsBitField.Flags.BanMembers,
            dmUsable: false,
        }
    }
}