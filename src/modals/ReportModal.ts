import { Modal, Bot } from "../classes/Bot";
import {
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";
import Utils from "../classes/Utils";

export default class extends Modal {
    override async run(interaction: ModalSubmitInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ephemeral: true});
        try {
            await Utils.sendWebhook(interaction.guildId!, 1, [
                Utils.getEmbed(0xff0000, {
                    title: "New Report",
                    fields: [
                        {
                            name: "Reporter",
                            value: `<@${interaction.user.id}> (${interaction.user.tag} | ${interaction.user.id})`,
                        },
                        {
                            name: "Domain",
                            value: interaction.fields.getTextInputValue('domainInput'),
                        },
                        {
                            name: "Reason",
                            value: interaction.fields.getTextInputValue('reasonInput'),
                        },
                        {
                            name: "Blocker",
                            value: interaction.fields.getTextInputValue('schoolFilterInput'),
                        }
                    ],
                    author: {
                        name: interaction.user.username,
                        iconURL: interaction.user.avatarURL()!
                    }
                })
            ])
        } catch (e) {
            await interaction.editReply({
                embeds: [
                    Utils.getEmbed(0xff0000, {
                        title: "Failed to send report",
                    })
                ]
            });
            return;
        }

        await interaction.editReply({
            embeds: [
                Utils.getEmbed(0x702963, {
                    title: "Success",
                    description: "Your report has been sent!"
                })
            ]
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