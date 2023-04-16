import { Modal, Bot } from "../classes/Bot";
import {
    ActionRowBuilder, ButtonStyle,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";

const AllowedButtonStyle = [
    "Primary",
    "Secondary",
    "Success",
    "Danger",
]
// @ts-ignore
const ButtonStyles = {
    Primary: ButtonStyle.Primary,
    Secondary: ButtonStyle.Secondary,
    Success: ButtonStyle.Success,
    Danger: ButtonStyle.Danger,
}
export default class extends Modal {
    override async run(interaction: ModalSubmitInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ephemeral: true});
        //let emoji = interaction.fields.getTextInputValue('emojiInput');
        //let label = interaction.fields.getTextInputValue('buttonLabelInput');
        let style = interaction.fields.getTextInputValue('buttonStyleInput');

        let allowed: boolean = false;

        for (const s of AllowedButtonStyle) {
            if (s.toLowerCase() == style.toLowerCase()) {
                style = s;
                allowed = true;
            }
        }

        if (!allowed) {
            await interaction.editReply({
                content: `Error: Invalid button style. Must be one of the following: ${AllowedButtonStyle.join(", ")}.`
            });
            return;
        }

        await interaction.editReply({
            content: "Success! Edited button style for this guild."
        });
    }

    override name(): string {
        return "Edit Webhook URL";
    }

    override id(): string {
        return "configeditbtnstylemdl";
    }

    override build(): ModalBuilder {
        return new ModalBuilder()
            .setCustomId(this.id())
            .setTitle(this.name())
            .addComponents(
                new ActionRowBuilder<ModalActionRowComponentBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId('emojiInput')
                            .setLabel('Button Emoji')
                            .setPlaceholder('Default emoji (e.g. 🔒) or custom emoji (e.g. :emoji:1234567890)')
                            .setStyle(TextInputStyle.Short)
                    ),
                new ActionRowBuilder<ModalActionRowComponentBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId('buttomLabelInput')
                            .setLabel('Button Label')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(false)
                            .setMaxLength(80)
                            .setMinLength(0)
                        ),
                new ActionRowBuilder<ModalActionRowComponentBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId('buttonStyleInput')
                            .setLabel('Button Style')
                            .setPlaceholder('ALLOWED: Primary, Secondary, Success, Danger')
                            .setStyle(TextInputStyle.Short)
                    )
            )
    }
}