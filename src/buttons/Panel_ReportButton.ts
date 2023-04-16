import { Button, Bot } from "../classes/Bot";
import {ButtonInteraction, ButtonStyle, ButtonBuilder} from "discord.js";

export default class extends Button {
    override build(): ButtonBuilder {
        return new ButtonBuilder()
            .setLabel("Report")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("⚠️")
            .setCustomId(this.id());
    }

    override id(): string {
        return "panelreportbtn";
    }

    override async run (interaction: ButtonInteraction, bot: Bot): Promise<void> {
        await interaction.showModal(bot.getModal("reportmdl")!.build());
    }
}