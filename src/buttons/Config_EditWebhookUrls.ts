import { Button, Bot } from "../classes/Bot";
import { ButtonInteraction, ButtonStyle, ButtonBuilder } from "discord.js";

export default class extends Button {
    override build(): ButtonBuilder {
        return new ButtonBuilder()
            .setLabel("Edit Webhook URLs")
            .setStyle(ButtonStyle.Primary)
            .setCustomId(this.id());
    }

    override id(): string {
        return "btnconfigeditwebhook";
    }

    override async run (interaction: ButtonInteraction, bot: Bot): Promise<void> {
        interaction.showModal(bot.getModal("configeditwebhookmdl")!.build([interaction.guild!.id]));
    }

}