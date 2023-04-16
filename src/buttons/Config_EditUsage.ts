import { Button, Bot } from "../classes/Bot";
import { ButtonInteraction, ButtonStyle, ButtonBuilder } from "discord.js";

export default class extends Button {
    override build(): ButtonBuilder {
        return new ButtonBuilder()
            .setLabel("Edit Usage Per User")
            .setStyle(ButtonStyle.Primary)
            .setCustomId(this.id());
    }

    override id(): string {
        return "btnconfigeditusagebtn";
    }

    override async run (interaction: ButtonInteraction, bot: Bot): Promise<void> {
        interaction.showModal(bot.getModal("configeditusagemdl")!.build());
    }

}