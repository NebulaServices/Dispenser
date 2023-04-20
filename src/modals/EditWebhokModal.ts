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

export default class extends Modal {
    override async run(interaction: ModalSubmitInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ephemeral: true});
        const discordWebhookRegex = /^(?:https:\/\/(?:canary|ptb)?\.?discord(?:app)?\.com\/api\/webhooks\/\d{17,19}\/[A-Za-z\d_-]{68})?$/
        const reportWebhook = interaction.fields.getTextInputValue('reportWebhookInput');
        const logWebhook = interaction.fields.getTextInputValue('logWebhookInput');

        if (!discordWebhookRegex.test(reportWebhook) || !discordWebhookRegex.test(logWebhook)) {
            await interaction.editReply({
                content: "Error: Invalid webhook URL. Must be a valid Discord webhook URL."
            });
            return;
        }
        await DB.setWebhookUrl(interaction.guild!.id, {
            reports: reportWebhook,
            logs: logWebhook
        })

        await interaction.editReply({
            content: "Success! Edited webhook URLs for this guild."
        });
    }

    override name(): string {
        return "Edit Webhook URL";
    }

    override id(): string {
        return "configeditwebhookmdl";
    }

    override build(): ModalBuilder {
        
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
                            .setStyle(TextInputStyle.Short)
                    ),
                new ActionRowBuilder<ModalActionRowComponentBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId('logWebhookInput')
                            .setLabel('Logging Webhook URL')
                            .setPlaceholder('https://discord.com/api/webhooks/1234567890/abcdefghijklmnopqrstuvwxyz')
                            .setStyle(TextInputStyle.Short)
                    )
            )
    }
}