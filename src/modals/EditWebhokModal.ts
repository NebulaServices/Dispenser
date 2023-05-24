import { Modal, Bot } from "../classes/Bot";
import {
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";
import DB from "../classes/DB";
import Utils from "../classes/Utils";

export default class extends Modal {
    override async run(interaction: ModalSubmitInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ephemeral: true});
        const discordWebhookRegex = /^(?:https:\/\/(?:canary|ptb)?\.?discord(?:app)?\.com\/api\/webhooks\/\d{17,19}\/[A-Za-z\d_-]{68})?$/
        const reportWebhook = interaction.fields.getTextInputValue('reportWebhookInput');
        const logWebhook = interaction.fields.getTextInputValue('logWebhookInput');

        if (!discordWebhookRegex.test(reportWebhook) || !discordWebhookRegex.test(logWebhook) && reportWebhook !== "" && logWebhook !== "") {
            await interaction.editReply({
                content: "Error: Invalid webhook URL. Must be a valid Discord webhook URL."
            });
            return;
        }
        try {
            await DB.setWebhookUrl(interaction.guild!.id, {
                reports: reportWebhook,
                logs: logWebhook
            })
        } catch (e) {
            await interaction.editReply({
                content: `Error: Failed to set webhook URL: ${e}`
            });
            return;
        }

        await interaction.editReply({
            content: "Success! Edited webhook URLs for this guild."
        });

        await Utils.sendWebhook(interaction.guild!.id, 2, [
            Utils.getEmbed(0x814fff, {
                title: `Webhook URLs Edited`,
                fields: [
                    {
                        name: "Edited By",
                        value: `<@${interaction.user.id}> (${interaction.user.tag} | ${interaction.user.id})`
                    }
                ]
            })
        ])
    }

    override name(): string {
        return "Edit Webhook URL";
    }

    override id(): string {
        return "configeditwebhookmdl";
    }

    override build(args: string[]): ModalBuilder {
        return new ModalBuilder()
            .setCustomId(this.id())
            .setTitle(this.name())
            .addComponents(
                new ActionRowBuilder<ModalActionRowComponentBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId('reportWebhookInput')
                            .setLabel('Reports Webhook URL')
                            .setPlaceholder('https://discord.com/api/webhooks/1234567890/abcdefghijklmnopqrstuvwxyz')
                            .setValue('')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(false)
                    ),
                new ActionRowBuilder<ModalActionRowComponentBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId('logWebhookInput')
                            .setLabel('Logging Webhook URL')
                            .setPlaceholder('https://discord.com/api/webhooks/1234567890/abcdefghijklmnopqrstuvwxyz')
                            .setValue('')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(false)
                    )
            )
    }
}