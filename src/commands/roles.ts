import {Command, CommandOption, Bot, CommandPermissions} from "../classes/Bot";
import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
} from "discord.js";
import DB from "../classes/DB";
import Utils from "../classes/Utils";


export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ephemeral: true});

        switch (interaction.options.getSubcommand()) {
            case "add": {
                if (!interaction.options.getInteger("limit") && !interaction.options.getBoolean("admin")) {
                    await interaction.editReply({ embeds: [ Utils.getEmbed(0xff0000, { title: `Failed to add role`, description: `Provide 1: AdminRole or SpecialLimit` }) ] });
                    return;
                }

                if (interaction.options.getInteger("limit")! && interaction.options.getInteger("limit")! < 1 || interaction.options.getInteger("limit")! > 99) {
                    await interaction.editReply({ embeds: [ Utils.getEmbed(0xff0000, { title: `Failed to add role`, description: `Limit must be between 1 and 99.` }) ] });
                    return;
                }

                try {
                    await DB.createRole(interaction.guildId!, interaction.options.getRole("role")!.id, interaction.options.getInteger("limit") as number, interaction.options.getBoolean("admin") as boolean)
                } catch (e) {
                    await interaction.editReply({ embeds: [ Utils.getEmbed(0xff0000, { title: `Failed to add role`, description: e!.toString() }) ] });
                    return;
                }

                await interaction.editReply({ embeds: [ Utils.getEmbed(0x814fff, { title: `Success`, description: `Added role <@&${interaction.options.getRole("role")!.id}>.`}) ]});

                await bot.setAdminRoles();

                await Utils.sendWebhook(interaction.guild!.id, 2, [
                    Utils.getEmbed(0x814fff, {
                        title: `Role Added`,
                        fields: [
                            {
                                name: "Role",
                                value: `<@&${interaction.options.getRole("role")!.id}>`,
                            },
                            {
                                name: "Created By",
                                value: `<@${interaction.user.id}> (${interaction.user.tag} | ${interaction.user.id})`,
                            },
                            {
                                name: "Special Limit",
                                value: String(interaction.options.getInteger("limit")) ?? "None",
                            },
                            {
                                name: "Admin Role",
                                value: String(interaction.options.getBoolean("admin")) ?? "None",
                            }
                        ]
                    })
                ])
            } break;

            case "remove": {
                try {
                    await DB.removeRole(interaction.guildId!, interaction.options.getRole("role")!.id)
                } catch (e) {
                    await interaction.editReply({ embeds: [ Utils.getEmbed(0xff0000, { title: `Failed to remove role`, description: e!.toString() }) ] });
                    return;
                }
                await interaction.editReply({ embeds: [ Utils.getEmbed(0x814fff, { title: `Success`, description: `Removed role <@&${interaction.options.getRole("role")!.id}>.`}) ]});

                await bot.setAdminRoles();

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
            } break;

            case "edit": {
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
            } break;

            case "list": {
                try {
                    await interaction.editReply({
                        embeds: [
                            Utils.getEmbed(0x814fff, {
                                title: "All Roles",
                                description: (await DB.getAll(interaction.guildId!, "roles")).map((r: any) => {
                                    return `> <@&${r.roleId}>\n${r.specialLimit ? `> Special Limit: ${r.specialLimit}\n` : ""} ${r.adminRole ? "> :lock_with_ink_pen: Admin role\n" : ""}`
                                }).join("\n") ?? "No roles"
                            })
                        ]
                    })
                } catch (e) {
                    console.log(e);
                    await interaction.editReply({
                        embeds: [
                            Utils.getEmbed(0xff0000, {
                                title: `Failed to list roles!`,
                                description: e!.toString()
                            })
                        ]
                    })
                }
            } break;
        }
    }

    override name(): string {
        return "roles";
    }

    override description(): string {
        return "Role management";
    }

    override options(): CommandOption[] {
        return [
            {
                name: "add",
                description: "Add a role",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "role",
                        description: "The role you want to add",
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
            },
            {
                name: "remove",
                description: "Remove a role",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "role",
                        description: "The role you want to remove",
                        type: ApplicationCommandOptionType.Role,
                        required: true
                    }
                ]
            },
            {
                name: "edit",
                description: "Edit a role",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
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
            },
            {
                name: "list",
                description: "List all roles",
                type: ApplicationCommandOptionType.Subcommand,
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