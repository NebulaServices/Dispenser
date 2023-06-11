import {Command, CommandOption, Bot, CommandPermissions} from "../classes/Bot";
import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
} from "discord.js";
import DB, {ButtonType} from "../classes/DB";
import Utils from "../classes/Utils";
// import DB, { ButtonType } from "../classes/DB";
// import Utils from "../classes/Utils";


export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ephemeral: true});

        switch (interaction.options.getSubcommand()) {
            case "create": {
                if (!/^[a-z0-9]{1,15}$/i.test(interaction.options.getString("name")! as string)) {
                    await interaction.editReply(`Invalid group name. Please make sure it is alphanumeric and less than 15 characters.`);
                    return;
                }

                if (!/[\w\d\s]{1,80}/.test(interaction.options.getString("label")! as string)) {
                    await interaction.editReply(`Invalid label.`);
                    return;
                }

                try {
                    await DB.createGroup(interaction.guild!.id, interaction.options.getString("name")!, interaction.user.id,
                        {
                            label: interaction.options.getString("label")!,
                            style: interaction.options.getString("style")! as ButtonType,
                            emoji: interaction.options.getString("emoji")!
                        }, interaction.options.getRole("role")?.id);
                } catch (e) {
                    await interaction.editReply({ embeds: [ Utils.getEmbed(0xff0000, { title: `Failed to create group`, description: e!.toString() }) ] });
                    return;
                }
                await interaction.editReply({ embeds: [ Utils.getEmbed(0x814fff, { title: `Success`, description: `Created group \`${interaction.options.getString("name")}\`.`}) ]});

                await Utils.sendWebhook(interaction.guildId!, 2, [
                    Utils.getEmbed(0x814fff, {
                        title: `Group Created`,
                        fields: [
                            {
                                name: "Group Name",
                                value: interaction.options.getString("name")!,
                            },
                            {
                                name: "Created By",
                                value: `<@${interaction.user.id}> (${interaction.user.tag} | ${interaction.user.id})`,
                            },
                            {
                                name: "Group Label",
                                value: interaction.options.getString("label")!,
                            },
                            {
                                name: "Group Style",
                                value: interaction.options.getString("style")!,
                            },
                            {
                                name: "Group Emoji",
                                value: interaction.options.getString("emoji")! ?? "None",
                            },
                            {
                                name: "Required Role",
                                value: interaction.options.getRole('role')?.toString() ?? "None",
                            }
                        ]
                    })
                ])
            } break;

            case "delete": {
                try {
                    await DB.deleteGroup(interaction.guild!.id, interaction.options.getString("name")!);
                } catch (e) {
                    await interaction.editReply({ embeds: [ Utils.getEmbed(0xff0000, { title: `Failed to delete group`, description: e!.toString() }) ] });
                    return;
                }
                await interaction.editReply({ embeds: [ Utils.getEmbed(0x814fff, { title: `Success`, description: `Deleted group \`${interaction.options.getString("name")}\`.`}) ]});

                await Utils.sendWebhook(interaction.guildId!, 2, [
                    Utils.getEmbed(0x814fff, {
                        title: `Group Deleted`,
                        fields: [
                            {
                                name: "Group Name",
                                value: interaction.options.getString("name")!,
                            },
                            {
                                name: "Deleted By",
                                value: `<@${interaction.user.id}> (${interaction.user.tag} | ${interaction.user.id})`,
                            },
                        ]
                    })
                ])
            } break;

            case "edit": {
                if (!/^[a-z0-9]{1,15}$/i.test(interaction.options.getString("name")! as string)) {
                    await interaction.editReply(`Invalid group name. Please make sure it is alphanumeric and less than 15 characters.`);
                    return;
                }

                if (!/[\w\d\s]{1,80}/.test(interaction.options.getString("label")! as string)) {
                    await interaction.editReply(`Invalid label.`);
                    return;
                }

                try {
                    await DB.editGroup(interaction.guild!.id, interaction.options.getString("name")!, interaction.user.id,
                        {
                            label: interaction.options.getString("label")! ?? undefined,
                            style: interaction.options.getString("style")! as ButtonType ?? undefined,
                            emoji: interaction.options.getString("emoji")! ?? undefined
                        }, interaction.options.getRole("role")?.id ?? undefined);
                } catch (e) {
                    await interaction.editReply({ embeds: [ Utils.getEmbed(0xff0000, { title: `Failed to edit group`, description: e!.toString() }) ] });
                    return;
                }
                await interaction.editReply({ embeds: [ Utils.getEmbed(0x814fff, { title: `Success`, description: `Edited group \`${interaction.options.getString("name")}\`.`}) ]});

                await Utils.sendWebhook(interaction.guildId!, 2, [
                    Utils.getEmbed(0x814fff, {
                        title: `Group Edited`,
                        fields: [
                            {
                                name: "Group Name",
                                value: interaction.options.getString("name")!,
                            },
                            {
                                name: "Edited By",
                                value: `<@${interaction.user.id}> (${interaction.user.tag} | ${interaction.user.id})`,
                            },
                            {
                                name: "Group Label",
                                value: interaction.options.getString("label")! ? interaction.options.getString("label")! : "None",
                            },
                            {
                                name: "Group Style",
                                value: interaction.options.getString("style")! ? interaction.options.getString("style")! : "None",
                            },
                            {
                                name: "Group Emoji",
                                value: interaction.options.getString("emoji")! ? interaction.options.getString("emoji")! : "None",
                            },
                            {
                                name: "Required Role",
                                value: interaction.options.getRole('role')?.toString() ?? "None",
                            }
                        ]
                    })
                ])
            } break;

            // case "list": {
            //
            // } break;
        }
    }

    override name(): string {
        return "groups";
    }

    override description(): string {
        return "Group management";
    }

    override options(): CommandOption[] {
        return [
            {
                name: "create",
                description: "Create a group",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "name",
                        description: "The name of the group internally",
                        type: ApplicationCommandOptionType.String,
                        required: true
                    },
                    {
                        name: "label",
                        description: "The text to display on the button",
                        type: ApplicationCommandOptionType.String,
                        required: true
                    },
                    {
                        name: "style",
                        description: "The style of the button",
                        type: ApplicationCommandOptionType.String,
                        choices: [
                            {
                                name: "Primary",
                                value: "PRIMARY"
                            },
                            {
                                name: "Secondary",
                                value: "SECONDARY"
                            },
                            {
                                name: "Success",
                                value: "SUCCESS"
                            },
                            {
                                name: "Danger",
                                value: "DANGER"
                            }
                        ],
                        required: true
                    },
                    {
                        name: "emoji",
                        description: "The emoji to use for the button",
                        type: ApplicationCommandOptionType.String,
                        required: false
                    },
                    {
                        name: "role",
                        description: "The role that is required to use the group",
                        type: ApplicationCommandOptionType.Role,
                        required: false
                    }
                ]
            },
            {
                name: "delete",
                description: "Delete a group",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "name",
                        description: "The name of the group internally",
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }
                ]
            },
            {
                name: "edit",
                description: "Edit a group",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "name",
                        description: "The name of the group",
                        type: ApplicationCommandOptionType.String,
                        required: true
                    },
                    {
                        name: "label",
                        description: "The text to display on the button",
                        type: ApplicationCommandOptionType.String,
                        required: false
                    },
                    {
                        name: "style",
                        description: "The style of the button",
                        type: ApplicationCommandOptionType.String,
                        choices: [
                            {
                                name: "Primary",
                                value: "PRIMARY"
                            },
                            {
                                name: "Secondary",
                                value: "SECONDARY"
                            },
                            {
                                name: "Success",
                                value: "SUCCESS"
                            },
                            {
                                name: "Danger",
                                value: "DANGER"
                            }
                        ],
                        required: false
                    },
                    {
                        name: "emoji",
                        description: "The emoji to use for the button",
                        type: ApplicationCommandOptionType.String,
                        required: false
                    },
                    {
                        name: "role",
                        description: "The role that is required to use the group",
                        type: ApplicationCommandOptionType.Role,
                        required: false
                    }
                ]
            },
            // {
            //     name: "list",
            //     description: "List all groups",
            //     type: ApplicationCommandOptionType.Subcommand
            // }
            // This isn't needed because of the links list cmd
        ]
    }

    override permissions(): CommandPermissions {
        return {
            dmUsable: false,
            adminRole: true,
        }
    }

}