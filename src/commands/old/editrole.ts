import {Command, CommandOption, Bot, CommandPermissions} from "../../classes/Bot";
import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
} from "discord.js";
import DB from "../../classes/DB";
import Utils from "../../classes/Utils";


export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ephemeral: true});

        if (!interaction.options.getInteger("limit") && !interaction.options.getBoolean("admin")) {
            await interaction.editReply({ embeds: [ Utils.getEmbed(0xff0000, { title: `Failed to edit role`, description: `Provide 1 to edit: AdminRole or SpecialLimit` }) ] });
            return;
        }

        if (interaction.options.getInteger("limit")! && interaction.options.getInteger("limit")! < 1 || interaction.options.getInteger("limit")! > 99) {
            await interaction.editReply({ embeds: [ Utils.getEmbed(0xff0000, { title: `Failed to edit role`, description: `Limit must be between 1 and 99.` }) ] });
            return;
        }

        try {
            await DB.editRole(interaction.guildId!, interaction.options.getRole("role")!.id, interaction.options.getInteger("limit") as number, interaction.options.getBoolean("admin") as boolean)
        } catch (e) {
            await interaction.editReply({ embeds: [ Utils.getEmbed(0xff0000, { title: `Failed to edit role`, description: e!.toString() }) ] });
            return;
        }

        await interaction.editReply({ embeds: [ Utils.getEmbed(0x814fff, { title: `Success`, description: `Edited role <@&${interaction.options.getRole("role")!.id}>.`}) ]});

        await bot.setAdminRoles();

        await Utils.sendWebhook(interaction.guild!.id, 2, [
            Utils.getEmbed(0x814fff, {
                title: `Role Edited`,
                fields: [
                    {
                        name: "Role",
                        value: `<@&${interaction.options.getRole("role")!.id}>`,
                    },
                    {
                        name: "Edited By",
                        value: `<@${interaction.user.id}> (${interaction.user.tag} | ${interaction.user.id})`,
                    },
                    {
                        name: "New Special Limit",
                        value: interaction.options.getInteger("limit") ? String(interaction.options.getInteger("limit")) : "None",
                    },
                    {
                        name: "New Admin Role",
                        value: String(interaction.options.getBoolean("admin")) ?? "None",
                    }
                ]
            })
        ])


    }

    override name(): string {
        return "editrole";
    }

    override description(): string {
        return "Edit a custom role.";
    }

    override options(): CommandOption[] {
        return [
            {
                name: "role",
                description: "The role you want edit",
                type: ApplicationCommandOptionType.Role,
                required: true
            },
            {
                name: "limit",
                description: "The new domain limit for this role",
                type: ApplicationCommandOptionType.Integer,
                required: false,
            },
            {
                name: "admin",
                description: "Should this role be an admin role",
                type: ApplicationCommandOptionType.Boolean,
                required: false,
            }
        ]
    }

    override permissions(): CommandPermissions {
        return {
            dmUsable: false,
            adminRole: true,
            adminPermissionBypass: true,
        }
    }
}