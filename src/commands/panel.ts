import {Command, CommandOption, Bot, CommandPermissions} from "../classes/Bot";
import {
    ActionRowBuilder, ApplicationCommandOptionType,
    ButtonBuilder,
    ChatInputCommandInteraction, Message
} from "discord.js";
import Utils from "../classes/Utils";
import DB from "../classes/DB";

export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        switch (interaction.options.getSubcommand()) {
            case "create": {
                let groups = await DB.getGroups(interaction.guild!.id);
                let rows: ActionRowBuilder<ButtonBuilder>[] = [];
                let buttons: ButtonBuilder[] = [];

                for (const group of groups) {
                    buttons.push(await bot.getButton("paneldispensebtn", [group.groupId])?.build([group.groupId, group.buttonLabel, group.buttonType, group.buttonEmoji])!);
                }

                if ((await DB.doesWebhookUrlsExist(interaction.guild!.id)).reports) {
                    buttons.push(await bot.getButton("panelreportbtn")?.build()!);
                }

                while (buttons.length > 0) {
                    const rowButtons = buttons.splice(0, 5);
                    rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(...rowButtons));
                }

                let msg = await interaction.channel!.send({
                    embeds: [
                        Utils.getEmbed(Utils.EmbedType.Purple, {
                            title: "Dispenser",
                            description: "Click the buttons below to dispense items.",
                        }),
                    ],
                    components: rows,
                });



                await interaction.editReply({
                    content: `Panel Created! \[[Link](\<${msg.url}\>)\]${rows.length === 0 ? "\nSince there are no buttons on the panel, configuration is required. Run /config for more information." : ""}`,
                })

                await Utils.sendWebhook(interaction.guildId!, Utils.WebhookType.Logs, [
                    Utils.getEmbed(Utils.EmbedType.Purple, {
                        title: `Panel Created`,
                        fields: [
                            {
                                name: "Created By",
                                value: `<@${interaction.user.id}> (${interaction.user.tag} | ${interaction.user.id})`,
                            }
                        ],
                        description: `[Link](\<${msg.url}\>)`,
                    })
                ])
            } break;

            case "update": {
                let msg: Message | undefined = undefined;
                let messages = await interaction.channel!.messages.fetch({ limit: 100 });
                for (const m of messages.values()) {
                    if (m.author.id === bot.client.user.id && m.embeds.length > 0 && m.embeds[0]!.title === "Dispenser") {
                        msg = m;
                        break;
                    }
                }

                if (!msg) {
                    await interaction.editReply({
                        content: `No panel found in this channel to edit.`,
                    })
                    return;
                }

                let groups = await DB.getGroups(interaction.guild!.id);
                let rows: ActionRowBuilder<ButtonBuilder>[] = [];
                let buttons: ButtonBuilder[] = [];

                for (const group of groups) {
                    buttons.push(await bot.getButton("paneldispensebtn", [group.groupId])?.build([group.groupId, group.buttonLabel, group.buttonType, group.buttonEmoji])!);
                }

                if ((await DB.doesWebhookUrlsExist(interaction.guild!.id)).reports) {
                    buttons.push(await bot.getButton("panelreportbtn")?.build()!);
                }

                while (buttons.length > 0) {
                    const rowButtons = buttons.splice(0, 5);
                    rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(...rowButtons));
                }

                let m = await msg.edit({
                    embeds: [
                        Utils.getEmbed(Utils.EmbedType.Purple, {
                            title: "Dispenser",
                            description: "Click the buttons below to dispense items.",
                        }),
                    ],
                    components: rows,
                });

                await interaction.editReply({
                    content: `Panel updated! \[[Link](\<${msg.url}\>)\]${rows.length === 0 ? "\nSince there are no buttons on the panel, configuration is required. Run /config for more information." : ""}`
                })

                await Utils.sendWebhook(interaction.guildId!, Utils.WebhookType.Logs, [
                    Utils.getEmbed(Utils.EmbedType.Purple, {
                        title: `Panel Updated`,
                        fields: [
                            {
                                name: "Updated By",
                                value: `<@${interaction.user.id}> (${interaction.user.tag} | ${interaction.user.id})`,
                            }
                        ],
                        description: `[Link](\<${m.url}\>)`,
                    })
                ])
            } break;
        }
    }

    override name(): string {
        return "panel";
    }

    override description(): string {
        return "Manage panels";
    }


    override options(): CommandOption[] {
        return [
            {
                name: "create",
                description: "Create a panel in this channel",
                type: ApplicationCommandOptionType.Subcommand
            },
            {
                name: "update",
                description: "Update the last panel sent in the channel",
                type: ApplicationCommandOptionType.Subcommand
            }
        ]
    }

    override permissions(): CommandPermissions {
        return {
            dmUsable: false,
            adminRole: true,
        }
    }
}