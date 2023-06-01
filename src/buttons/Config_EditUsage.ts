import { Button, Bot } from "../classes/Bot";
import { ButtonInteraction, ButtonStyle, ButtonBuilder } from "discord.js";

export default class extends Button {
    override async build(): Promise<ButtonBuilder> {
        return new ButtonBuilder()
            .setLabel("Edit Usage Per User")
            .setStyle(ButtonStyle.Primary)
            .setCustomId(await this.id());
    }

    override id(): string {
        return "btnconfigeditusagebtn";
    }

    override async run (interaction: ButtonInteraction, bot: Bot): Promise<void> {
        await interaction.showModal(await bot.getModal("configeditusagemdl")!.build([interaction.guild!.id]));
    }

}