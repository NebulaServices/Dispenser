import {Button, Bot, CommandPermissions} from "../classes/Bot";
import { ButtonInteraction, ButtonStyle, ButtonBuilder } from "discord.js";

export default class extends Button {
    override async build(): Promise<ButtonBuilder> {
        return new ButtonBuilder()
            .setLabel("Edit Webhook URLs")
            .setStyle(ButtonStyle.Primary)
            .setCustomId(await this.id());
    }

    override id(): string {
        return "btnconfigeditwebhook";
    }

    override async run (interaction: ButtonInteraction, bot: Bot): Promise<void> {
        await interaction.showModal(await bot.getModal("configeditwebhookmdl")!.build([interaction.guild!.id]));
    }

    override permissions(): CommandPermissions {
        return {
            adminRole: true
        }
    }

}