import { Modal, Bot } from "../classes/Bot";
import {
    ActionRowBuilder, ButtonStyle,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";
import DB from "../classes/DB";

const AllowedButtonStyle = [
    "Primary",
    "Secondary",
    "Success",
    "Danger",
]
export const ButtonStyles = {
    "primary": ButtonStyle.Primary,
    "secondary": ButtonStyle.Secondary,
    "success": ButtonStyle.Success,
    "danger": ButtonStyle.Danger,
}
export default class extends Modal {
    override async run(interaction: ModalSubmitInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ephemeral: true});
        let emoji = interaction.fields.getTextInputValue('emojiInput');
        let label = interaction.fields.getTextInputValue('buttonLabel');
        let style = interaction.fields.getTextInputValue('buttonStyle');

        if (!emoji && !label) {
            await interaction.editReply({
                content: "Error: Must provide (1): emoji or a label."
            });
            return;
        }

        const emojiRegex = /^(?:(?<=<):\w{2,}:\d+>)|(?:[\u{1F000}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F910}-\u{1F96B}\u{1F980}-\u{1F991}\u{1F9C0}\u{1F9D0}])$/u;

        if (!emojiRegex.test(emoji) && emoji) {
            await interaction.editReply({
                content: "Error: Invalid emoji. Must be a custom emoji or normal emoji."
            });
            return;
        }

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

        DB.updateBtn(interaction.guildId!, { emoji: emoji, label: label, style: style }).then(() => {
            interaction.editReply({
                content: "Success! Edited button style for this guild."
            });
        });
    }

    override name(): string {
        return "Edit Webhook URL";
    }

    override id(): string {
        return "configeditbtnstylemdl";
    }

    override build(args: string[]): ModalBuilder {
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
                            .setRequired(false)
                            .setValue("")
                    ),
                new ActionRowBuilder<ModalActionRowComponentBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId('buttonLabel')
                            .setLabel('Button Label')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(false)
                            .setMaxLength(80)
                            .setMinLength(0)
                            .setValue("")
                        ),
                new ActionRowBuilder<ModalActionRowComponentBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId('buttonStyle')
                            .setLabel('Button Style')
                            .setPlaceholder('ALLOWED: Primary, Secondary, Success, Danger')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                            .setValue("")
                    )
            )
    }
}