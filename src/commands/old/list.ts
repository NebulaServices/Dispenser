import { Command, CommandOption, Bot, CommandPermissions } from "../../classes/Bot";
import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction
} from "discord.js";
import DB from "../../classes/DB";
import Utils from "../../classes/Utils";

export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ ephemeral: interaction.options.getBoolean("ephemeral") ?? true });
        try {
            switch (interaction.options.getString("type")!) {
                case "links":
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
                    break;
                case "roles":
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
                    break;
            }
        } catch (e) {
            console.log(e);
            await interaction.editReply({
                embeds: [
                    Utils.getEmbed(0xff0000, {
                        title: `Failed to list ${interaction.options.getString("type")}!`,
                        description: e!.toString()
                    })
                ]
            })
            return;
        }
    }

    override name(): string {
        return "list";
    }

    override description(): string {
        return "List db entries";
    }

    override options(): CommandOption[] {
        return [
            {
                name: "type",
                description: "What to list",
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    {
                        name: "Links",
                        value: "links"
                    },
                    {
                        name: "Roles",
                        value: "roles"
                    }
                ]
            },
            {
                name: "ephemeral",
                description: "Whether the response should be ephemeral or not.",
                type: ApplicationCommandOptionType.Boolean,
                required: false
            }
        ];
    }
    override permissions(): CommandPermissions {
        return {
            adminRole: true,
        }
    }
}