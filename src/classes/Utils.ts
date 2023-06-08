import { EmbedBuilder, WebhookClient} from "discord.js";
import {Bot} from "./Bot";
import DB from "./DB";


export default class Utils {
    static getEmbed(color: number, data: { title?: string, description?: string, imageURL?: string, author?: { name: string, iconURL: string }, fields?: { name: string, value: string, inline?: boolean }[] }): EmbedBuilder {
        let embed = new EmbedBuilder()

        if (data.title) embed.setTitle(data.title);
        if (data.description) embed.setDescription(data.description);
        if (Bot.client.user && Bot.client) {
            embed.setFooter({
                text: Bot.client.user.username,
                iconURL: Bot.client.user.avatarURL()!
            });
        }
        if (data.imageURL) embed.setImage(data.imageURL);
        if (data.author) embed.setAuthor({
            name: data.author.name,
            iconURL: data.author.iconURL
        });
        if (data.fields) {
            for (let field of data.fields) {
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

    static async sendWebhook(guildId: string, type: 1 | 2, embeds: [EmbedBuilder], content?: string): Promise<void> {
        let urls = await DB.getWebhookUrls(guildId)
        switch (type) {
            case 1: {
                if (!urls.reports) return;
                const webhookClient = new WebhookClient({ url: urls.reports });
                await webhookClient.send({
                    content: content,
                    embeds: embeds
                })
            } break;
            case 2: {
                if (!urls.logs) return;
                const webhookClient = new WebhookClient({ url: urls.logs });
                await webhookClient.send({
                    content: content,
                    embeds: embeds
                })
            } break;
            default: {
                throw new Error("Invalid webhook type");
            }
        }
    }

    static splitMessage(text: string, { maxLength = 2_000, char = '\n', prepend = '', append = '' } = {}): string[] {
        if (text.length <= maxLength) return [text];
        let splitText = [text];
        if (Array.isArray(char)) {
            while (char.length > 0 && splitText.some(elem => elem.length > maxLength)) {
                const currentChar = char.shift();
                if (currentChar instanceof RegExp) {
                    splitText = splitText.flatMap(chunk => chunk.split(currentChar).filter(Boolean));
                } else {
                    splitText = splitText.flatMap(chunk => chunk.split(currentChar));
                }
            }
        } else {
            splitText = text.split(char);
        }
        if (splitText.some(elem => elem.length > maxLength)) throw new RangeError('SPLIT_MAX_LEN');
        const messages = [];
        let msg = '';
        for (const chunk of splitText) {
            if (msg && (msg + char + chunk + append).length > maxLength) {
                messages.push(msg + append);
                msg = prepend;
            }
            msg += (msg && msg !== prepend ? char : '') + chunk;
        }
        return messages.concat(msg).filter(m => m);
    }


}