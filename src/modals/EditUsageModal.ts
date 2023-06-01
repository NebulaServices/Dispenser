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

        await Utils.sendWebhook(interaction.guildId!, 2, [
            Utils.getEmbed(0x814fff, {
                title: `Usage Modified`,
                description: `Allowed usage for this guild has been modified.`,
                fields: [
                    {
                        name: "New Usage",
                        value: usage,
                        inline: false
                    },
                    {
                        name: "Modified By",
                        value: `<@${interaction.user.id}> (${interaction.user.tag} | ${interaction.user.id})`,
                        inline: false
                    }
                ]
            })
        ])
    }

    override name(): string {
        return "Edit User Usage";
    }

    override id(): string {
        return "configeditusagemdl";
    }

    override async build(args: string[]): Promise<ModalBuilder> {
        let usage;
        try {
            if (args[0]) {
                usage = await DB.getServerUsage(args[0]);
            }
        } catch (e) {}
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
                            .setValue(usage.toString() || "")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    )
            )
    }
}