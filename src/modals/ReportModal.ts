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
        //let domain = interaction.fields.getTextInputValue('domainInput');
        //let reason = interaction.fields.getTextInputValue('reasonInput');
        //let blocker = interaction.fields.getTextInputValue('blockerInput');

        await interaction.editReply({
            content: "Your report has been submitted!"
        });
    }

    override name(): string {
        return "Report";
    }

    override id(): string {
        return "reportmdl";
    }

    override build(): ModalBuilder {
        return new ModalBuilder()
            .setCustomId(this.id())
            .setTitle(this.name())
            .addComponents(
                new ActionRowBuilder<ModalActionRowComponentBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId('domainInput')
                            .setLabel('Domain to report')
                            .setPlaceholder("example.com")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                new ActionRowBuilder<ModalActionRowComponentBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId('reasonInput')
                            .setLabel('Reason for report')
                            .setPlaceholder("Reason")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                new ActionRowBuilder<ModalActionRowComponentBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId('schoolFilterInput')
                            .setLabel('The filter you have')
                            .setPlaceholder("lightspeed, goguardian, etc.")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
            )
    }
}