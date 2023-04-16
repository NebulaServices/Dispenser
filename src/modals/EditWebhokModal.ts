import { Modal, Bot } from "../classes/Bot";
import {
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";

export default class extends Modal {
    override async run(interaction: ModalSubmitInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ephemeral: true});
        // TODO: Add validation for webhook URLs
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
                            .setValue('a') // TODO: Get preexisting value from database
                            .setStyle(TextInputStyle.Short)
                    ),
                new ActionRowBuilder<ModalActionRowComponentBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId('logWebhookInput')
                            .setLabel('Logging Webhook URL')
                            .setPlaceholder('https://discord.com/api/webhooks/1234567890/abcdefghijklmnopqrstuvwxyz')
                            .setValue('a') // TODO: Get preexisting value from database
                            .setStyle(TextInputStyle.Short)
                    )
            )
    }
}