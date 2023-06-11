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
                let domain = interaction.options.getString("link")!;
                try {
                    await DB.createDomain(interaction.guildId!, interaction.user.id, interaction.options.getString("link")!, interaction.options.getString("group")!);
                } catch (e) {
                    await interaction.editReply({ embeds: [ Utils.getEmbed(0xff0000, { title: `Failed to add the link`, description: e!.toString() }) ] });
                    return;
                }
                await interaction.editReply({ embeds: [ Utils.getEmbed(0x814fff, { title: `Success`, description: `Added ${domain} to group \`${interaction.options.getString("group")}\`.`}) ]});

                await Utils.sendWebhook(interaction.guildId!, 2, [
                    Utils.getEmbed(0x814fff, {
                        title: `Link Added`,
                        fields: [
                            {
                                name: "Link",
                                value: interaction.options.getString("link")!,
                            },
                            {
                                name: "Group",
                                value: interaction.options.getString("group")!,
                            },
                            {
                                name: "Added By",
                                value: `<@${interaction.user.id}> (${interaction.user.tag} | ${interaction.user.id})`,
                            },
                        ]
                    })
                ])
            } break;

            case "delete": {
                try {
                    await DB.deleteDomain(interaction.guildId!, interaction.options.getString("link")!, interaction.options.getString("group")!);
                } catch (e) {
                    await interaction.editReply({ embeds: [ Utils.getEmbed(0xff0000, { title: `Failed to remove the link`, description: e!.toString() }) ] });
                    return;
                }

                await interaction.editReply({ embeds: [ Utils.getEmbed(0x814fff, { title: `Success`, description: `Removed ${interaction.options.getString("link")!} from group \`${interaction.options.getString("group")}\`.`}) ]});

                await Utils.sendWebhook(interaction.guildId!, 2, [
                    Utils.getEmbed(0x814fff, {
                        title: `Link Removed`,
                        fields: [
                            {
                                name: "Link",
                                value: interaction.options.getString("link")!,
                            },
                            {
                                name: "Group",
                                value: interaction.options.getString("group")!,
                            },
                            {
                                name: "Added By",
                                value: `<@${interaction.user.id}> (${interaction.user.tag} | ${interaction.user.id})`,
                            },
                        ]
                    })
                ])
            } break;

            case "list": {
                try {
                    await interaction.editReply({
                        embeds: [
                            Utils.getEmbed(0x814fff, {
                                title: "All Links",
                                description: (await DB.getAll(interaction.guildId!, "groups")).map((g: any) => {
                                    return `**${g.groupId}**${g.requiredRoleId ? ` - Requires <@&${g.requiredRoleId}>` : ``}\n${g.domains.length >= 1 ? g.domains.map((l: any) => {
                                        return `\`${l.domainName}\``;
                                    }).join(", ") : `No links in this group`}`
                                }).join("\n\n") || `No links in this server`
                            })
                        ]
                    })
                } catch (e) {
                    console.log(e);
                    await interaction.editReply({
                        embeds: [
                            Utils.getEmbed(0xff0000, {
                                title: `Failed to list links!`,
                                description: e!.toString()
                            })
                        ]
                    })
                }
            } break;
        }
    }

    override name(): string {
        return "links";
    }

    override description(): string {
        return "Link management";
    }

    override options(): CommandOption[] {
        return [
            {
                name: "add",
                description: "Add a link to the bot",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "group",
                        description: "The group to add the domain to",
                        type: ApplicationCommandOptionType.String,
                        required: true
                    },
                    {
                        name: "link",
                        description: "The link to add",
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }
                ]
            },
            {
                name: "delete",
                description: "Delete a link from the bot",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "group",
                        description: "The group to delete from",
                        type: ApplicationCommandOptionType.String,
                        required: true
                    },
                    {
                        name: "link",
                        description: "The link to delete",
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }
                ]
            },
            {
                name: "list",
                description: "List all links",
                type: ApplicationCommandOptionType.Subcommand,
            }
        ]
    }

    override permissions(): CommandPermissions {
        return {
            dmUsable: false,
            adminRole: true
        }
    }

}