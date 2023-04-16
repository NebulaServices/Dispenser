import { Button, Bot } from "../classes/Bot";
import {ButtonInteraction, ButtonBuilder, Message} from "discord.js";
import DB from "../classes/DB";
import Utils from '../classes/Utils'


export default class extends Button {
    override build(args: string[]): ButtonBuilder {
        let server: any;
        console.log(args)
        if (args && args.length > 0) {
            server = DB.getBtn(args[0]!);
        }
        // convert server.buttonColor to Utils.ButtonStyles
        return new ButtonBuilder()
            .setLabel(server.buttonLabel)
            //@ts-ignore
            .setStyle(Utils.ButtonStyles[server.buttonColor])
            .setEmoji(server.buttonEmoji)
            .setCustomId(this.id());
    }

    override id(): string {
        return "paneldispensebtn";
    }

    override async run (interaction: ButtonInteraction, bot: Bot): Promise<any> {
        await interaction.deferReply({ephemeral: true})
        let domain = DB.getDomain(interaction.guild!.id, interaction.user.id);
        if (!domain) {
            return interaction.editReply({
                embeds: [
                    {
                        title: "You are out of usage for this month.",
                        description: "Check back soon to get more links."
                    }
                ]
            })
        }
        let m: Message;
        let usageLeft = 3;
        try {
            m = await interaction.user.send({embeds: [{
                title: "Here's your Link!",
                description: "https://example.com",
                    fields: [
                        {
                            name: "Usage",
                            value: `You have only ${usageLeft} uses left this month.`
                        },
                        {
                            name: "Why?",
                            value: "We limit the amount of links you can generate per month to prevent abuse. Please contact us with any issues!"
                        }
                ]
                }]});
        } catch (e) {
            return interaction.editReply({
                embeds: [
                    {
                        title: "Couldn't message you. Enable DMs and try again.",
                        image: {
                            url: "https://media.discordapp.net/attachments/1083220678624411738/1091536310377922611/DiscordCanary_MM7anpQmHc.png"
                        }
                    }
                ]})
        }
        await interaction.editReply({
            content: `Check your DMs. \[[Jump to message](\<${m!.url}\>)\]`,
        })
    }
}