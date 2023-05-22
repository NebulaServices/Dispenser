import { EmbedBuilder, WebhookClient} from "discord.js";
import {Bot} from "./Bot";
import DB from "./DB";


export default class Utils {
    static getEmbed(color: number, s: { title?: string, description?: string, imageURL?: string, author?: { name: string, iconURL: string }, fields?: { name: string, value: string, inline?: boolean }[] }): EmbedBuilder {
        let embed = new EmbedBuilder()

        if (s.title) embed.setTitle(s.title);
        if (s.description) embed.setDescription(s.description);
        if (Bot.client.user && Bot.client) {
            embed.setFooter({
                text: Bot.client.user.username,
                iconURL: Bot.client.user.avatarURL()!
            });
        }
        if (s.imageURL) embed.setImage(s.imageURL);
        if (s.author) embed.setAuthor({
            name: s.author.name,
            iconURL: s.author.iconURL
        });
        if (s.fields) {
            for (let field of s.fields) {
                embed.addFields({
                    name: field.name,
                    value: field.value,
                    inline: field.inline
                })
            }
        }
        embed.setColor(color);
        return embed;
    }

    static async sendWebhook(guildId: string, type: 1 | 2, embeds: [EmbedBuilder]): Promise<void> {
        let urls = await DB.getWebhookUrls(guildId)
        switch (type) {
            case 1: {
                if (!urls.reports) throw new Error("No reports webhook");
                const webhookClient = new WebhookClient({ url: urls.reports });
                await webhookClient.send({
                    embeds: embeds
                })
            } break;
            case 2: {
                if (!urls.logs) throw new Error("No logs webhook");
                const webhookClient = new WebhookClient({ url: urls.logs });
                await webhookClient.send({
                    embeds: embeds
                })
            } break;
            default: {
                throw new Error("Invalid webhook type");
            }
        }
    }
}