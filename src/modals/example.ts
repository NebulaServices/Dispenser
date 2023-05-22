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
        await interaction.editReply({
            content: `Ok! You said: ${interaction.fields.getTextInputValue('input1')}`
        });
    }

    override name(): string {
        return "Example";
    }

    override id(): string {
        return "examplemdl";
    }

    override build(): ModalBuilder {
        return new ModalBuilder()
            .setCustomId(this.id())
            .setTitle(this.name())
            .addComponents(
                new ActionRowBuilder<ModalActionRowComponentBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId('input1')
                            .setLabel('here\'s an input')
                            .setPlaceholder("placeholder")
                            .setStyle(TextInputStyle.Short) // TextInputStyle.Short is a single line input, TextInputStyle.Long is a multi-line input
                            .setRequired(true)
                    ),
            )
    }
}