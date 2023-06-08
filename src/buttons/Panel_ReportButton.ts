import {Bot, Button, CommandPermissions} from "../classes/Bot";
import {ButtonBuilder, ButtonInteraction, ButtonStyle} from "discord.js";


export default class extends Button {

    // write a build override that disables the button if !DB.doesReporeWebhookExist(interaction.guildId!)
    override async build(): Promise<ButtonBuilder> {
        return new ButtonBuilder()
            .setLabel("Send a report")
            .setStyle(ButtonStyle.Danger)
            .setCustomId(await this.id());
    }



    override id(): string {
        return "panelreportbtn";
    }

    override async run (interaction: ButtonInteraction, bot: Bot): Promise<void> {
        await interaction.showModal(await bot.getModal("reportmdl")!.build([interaction.guild!.id]));
    }

    override permissions(): CommandPermissions {
        return {
            adminRole: false
        }
    }
}