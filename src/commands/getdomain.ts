import { Command, CommandOption, Bot, CommandPermissions } from "../classes/Bot";
import {ApplicationCommandOptionType, ChatInputCommandInteraction, Message} from "discord.js";
import DB from "../classes/DB";
import Utils from "../classes/Utils";
export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        if (!interaction.inCachedGuild()) {
            return
        }
        let m: Message;
        await interaction.deferReply({ephemeral: true})
        try {
            m = await interaction.user.send("Getting your domain...");
        } catch (e) {
            interaction.editReply({
                embeds: [
                    {
                        title: "Couldn't message you. Enable DMs and try again.",
                        image: {
                            url: "https://media.discordapp.net/attachments/1083220678624411738/1091536310377922611/DiscordCanary_MM7anpQmHc.png"
                        }
                    }
                ]})
            return;
        }
        let response;
        try {
            response = await DB.getDomain(interaction.guild!.id, interaction.user.id, interaction.options.getString('group') as string, interaction.member!.roles.cache.map(role => role.id))!;
        } catch (e) {
            console.log(e);
            await interaction.editReply({
                embeds: [
                    Utils.getEmbed(0xff0000, {
                        title: "I couldn't provide you with a domain.",
                        description: "Sorry, I couldn't get a domain for you due to an internal error. If this happens repeatedly, we encourage you to make a ticket."
                    })
                ]
            })
            await Utils.sendWebhook(interaction.guild!.id, 2, [
                Utils.getEmbed(0xff0000, {
                    title: "Domain Dispense Failed",
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
                            value: interaction.options.getString('group') as string
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
                            title: "I couldn't provide you with a domain.",
                            description: response.text
                        })
                    ]
                })
                await Utils.sendWebhook(interaction.guild!.id, 2, [
                    Utils.getEmbed(0xff0000, {
                        title: "Domain Dispense Failed",
                        fields: [
                            {
                                name: "User",
                                value: `<@${interaction.user.id}> (${interaction.user.id})`
                            },
                            {
                                name: "Error",
                                value: response.text ?? "Unknown"
                            },
                            {
                                name: "Group",
                                value: interaction.options.getString('group') as string ?? "Unknown"
                            }
                        ]
                    })
                ])
                return;
            }
            case "success": {
                try {
                    await m.edit({
                        content: null,
                        embeds: [
                            Utils.getEmbed(0x00ff00, {
                                title: "Here's your Link!",
                                description: response.domain,
                                fields: [
                                    {
                                        name: "Remaining Uses",
                                        value: response.text,
                                        inline: false
                                    }
                                ]
                            })
                        ]});
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
                                title: "I couldn't provide you with a domain.",
                                description: response.text,
                                // imageURL: "https://media.discordapp.net/attachments/1083220678624411738/1091536310377922611/DiscordCanary_MM7anpQmHc.png"
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

    override name(): string {
        return "getdomain";
    }

    override description(): string {
        return "get a domain";
    }

    override options(): CommandOption[] {
        return [
            {
                type: ApplicationCommandOptionType.String,
                name: "group",
                description: "This is an example of choices",
                required: false,
            }
        ];
    }
    override permissions(): CommandPermissions {
        return {
            //permissions: PermissionsBitField.Flags.ManageMessages, // The permissions the user needs to run the command as a bigint
            dmUsable: false
        }
    }
}