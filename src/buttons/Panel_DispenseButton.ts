import {Button, Bot, CommandPermissions} from "../classes/Bot";
import {ButtonInteraction, ButtonBuilder, ButtonStyle, Message} from "discord.js";
import DB from "../classes/DB";
import Utils from "../classes/Utils";

function convertPrismaEnumToButtonStyle(prismaEnum: string): ButtonStyle {
    switch (prismaEnum) {
        case 'PRIMARY':   return ButtonStyle.Primary;
        case 'SECONDARY': return ButtonStyle.Secondary;
        case 'SUCCESS':   return ButtonStyle.Success;
        case 'DANGER':    return ButtonStyle.Danger;
        default:          return ButtonStyle.Primary;
    }
}

export default class extends Button {
    override async build(args: string[]): Promise<ButtonBuilder> { // 1 - group ID 2 - button label 3 - button style 4 - button emoji
        if (!args) {
            return new ButtonBuilder()
                .setLabel("Dispense")
                .setDisabled(true)

        }
        let buttonBuilder = new ButtonBuilder()
            .setLabel(args[1]!)
            .setCustomId(this.id([args[0] as string]))
            .setStyle(ButtonStyle.Primary)
            .setStyle(convertPrismaEnumToButtonStyle(args[2] as string))


        if (args[3]) {
            try {
                buttonBuilder.setEmoji(args[3]!)
            } catch (e) {
                console.log(e);
            }
        }

        return buttonBuilder
    }

    override id(args: string[]): string {
        if (!args) {
            return "paneldispensebtn";
        }
        if (args[0]) {
            return `paneldispensebtn-${args[0]}`;
        }
        return "paneldispensebtn";
    }

    override async run(interaction: ButtonInteraction, bot: Bot): Promise<any> {
        if (!interaction.inCachedGuild()) {
            return
        }
        await interaction.deferReply({ephemeral: true})
        let m = await interaction.fetchReply() as Message;
        let response;
        try {
            response = await DB.getDomain(interaction.guild!.id, interaction.user.id, interaction.customId.split('-')[1] ?? "", interaction.member!.roles.cache.map(role => role.id))!;
        } catch (e) {
            console.log(e);
            await interaction.editReply({
                embeds: [
                    Utils.getEmbed(0xff0000, {
                        title: "I couldn't provide you with a domain.",
                        description: "Sorry, I couldn't get your link due to an internal error. If this happens repeatedly, we encourage you to make a ticket."
                    })
                ]
            })
            await Utils.sendWebhook(interaction.guild!.id, 2, [
                Utils.getEmbed(0xff0000, {
                    title: ":no_entry: Domain dispense failed due to exception",
                    fields: [
                        {
                            name: "User",
                            value: `<@${interaction.user.id}> (${interaction.user.id})`
                        },
                        {
                            name: "Error",
                            value: e!.toString()
                        },
                        {
                            name: "Group",
                            value: interaction.customId.split('-')[1] ?? "Unknown"
                        }
                    ]
                })
            ])
            return;
        }
        switch (response.type) {
            case "error": {
                await interaction.editReply({
                    embeds: [
                        Utils.getEmbed(0xff0000, {
                            title: "I couldn't provide you with a link",
                            description: response.userText
                        })
                    ]
                })
                await Utils.sendWebhook(interaction.guild!.id, 2, [
                    Utils.getEmbed(0xff0000, {
                        title: "Domain dispense failed",
                        fields: [
                            {
                                name: "User",
                                value: `<@${interaction.user.id}> (${interaction.user.id})`
                            },
                            {
                                name: "Error",
                                value: response.systemText ?? "Unknown"
                            },
                            {
                                name: "Group",
                                value: interaction.customId.split('-')[1] ?? "Unknown"
                            }
                        ]
                    })
                ])
                return;
            }
            case "success": {
                try {
                    try {
                        m = await interaction.user.send({
                            embeds: [
                                Utils.getEmbed(0x7f5af0, {
                                    title: "Proxy Request",
                                    description: `Enjoy your site!\n` + response.domain,
                                    fields: [
                                        {
                                            name: "Remaining Uses",
                                            value: response.userText,
                                            inline: false
                                        }
                                    ]
                                })
                            ]});
                    } catch (e) {
                        await interaction.editReply({
                            embeds: [
                                {
                                    title: "Couldn't message you, Enable DMs and try again",
                                    image: {
                                        url: "https://cdn.nsmbu.net/dispenser/EnableDMs.png"
                                    }
                                }
                            ]
                        })
                        return;
                    }
                    await DB.setUsed(interaction.guild!.id, interaction.user.id, response.domainClean, response.usageCount);
                    await Utils.sendWebhook(interaction.guild!.id, 2, [
                        Utils.getEmbed(0x00ff00, {
                            title: "Domain Dispensed",
                            fields: [
                                {
                                    name: "User",
                                    value: `<@${interaction.user.id}> (${interaction.user.id})`,
                                    inline: false
                                },
                                {
                                    name: "Domain",
                                    value: response.domain,
                                    inline: false
                                },
                                {
                                    name: "Group",
                                    value: `\`${response.group}\``,
                                    inline: false
                                },
                                {
                                    name: "Remaining uses",
                                    value: response.usageLeft.toString(),
                                    inline: false
                                }
                            ]
                        })
                    ])

                } catch (e) {
                    console.log(e);
                    await interaction.editReply({
                        embeds: [
                            Utils.getEmbed(0xff0000, {
                                title: "I couldn't provide you with a link",
                                description: response.userText,
                            })
                        ]
                    })
                    return;
                }
            }
        }

        await interaction.editReply({
            content: `Check your DMs. \[[Jump to message](\<${m!.url}\>)\]`,
        })
    }

    override permissions(): CommandPermissions {
        return {
            adminRole: false
        }
    }
}
