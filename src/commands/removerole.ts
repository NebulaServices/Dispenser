import {Command, CommandOption, Bot, CommandPermissions} from "../classes/Bot";
import {ApplicationCommandOptionType, ChatInputCommandInteraction, /*PermissionsBitField*/} from "discord.js";
import DB from "../classes/DB";
import Utils from "../classes/Utils";


export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ephemeral: true});

        try {
            await DB.removeRole(interaction.guildId!, interaction.options.getRole("role")!.id)
        } catch (e) {
            await interaction.editReply({ embeds: [ Utils.getEmbed(0xff0000, { title: `Failed to remove role`, description: e!.toString() }) ] });
            return;
        }
        await interaction.editReply({ embeds: [ Utils.getEmbed(0x814fff, { title: `Success`, description: `Removed role <@&${interaction.options.getRole("role")!.id}>.`}) ]});

        await Utils.sendWebhook(interaction.guild!.id, 2, [
            Utils.getEmbed(0x814fff, {
                title: `Role Removed`,
                fields: [ 
                    {
                        name: "Role",
                        value: `<@&${interaction.options.getRole("role")!.id}>`,
                    },
                    {
                        name: "Deleted By",
                        value: `<@${interaction.user.id}> (${interaction.user.tag} | ${interaction.user.id})`,
                    }
                ]
            })
        ])
    }

    override name(): string {
        return "removerole";
    }

    override description(): string {
        return "Remove a custom role. IRREVERSIBLE!";
    }

    override options(): CommandOption[] {
        return [
            {
                name: "role",
                description: "The role you want to remove",
                type: ApplicationCommandOptionType.Role,
                required: true
            }
        ]
    }

    override permissions(): CommandPermissions {
        return {
            dmUsable: false,
            //permissions: PermissionsBitField.Flags.ManageGuild,
        }
    }

}