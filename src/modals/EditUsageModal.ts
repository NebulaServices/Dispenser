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
        let usage = interaction.fields.getTextInputValue('usageInput');
        let msg: string;

        if (/^[1-9][0-9]?$/.test(usage)) {
            msg = "Success! Edited usage for this guild."
            await DB.updateUsage(interaction.guildId!, Number(usage));
        } else {
            msg = "Error: Invalid usage. Must be a number between 1 and 99."
        }

        await interaction.editReply({
            content: msg
        });
    }

    override name(): string {
        return "Edit User Usage";
    }

    override id(): string {
        return "configeditusagemdl";
    }

    override build(args: string[]): ModalBuilder {
        return new ModalBuilder()
            .setCustomId(this.id())
            .setTitle(this.name())
            .addComponents(
                new ActionRowBuilder<ModalActionRowComponentBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId('usageInput')
                            .setLabel('Usage')
                            .setPlaceholder('1-99')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    )
            )
    }
}