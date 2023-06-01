import {Bot, Button} from "../classes/Bot";
import {ButtonBuilder, ButtonInteraction, ButtonStyle} from "discord.js";


export default class extends Button {

    // write a build override that disables the button if !DB.doesReporeWebhookExist(interaction.guildId!)
    override async build(args: string[]): Promise<ButtonBuilder> {
        let builder = new ButtonBuilder()
        if (args[0] == "true") {
            builder.setDisabled(true);
        }
        
        builder
            .setLabel("Send a report")
            .setStyle(ButtonStyle.Danger)
            .setCustomId(await this.id());

        return builder;
    }



    override id(): string {
        return "panelreportbtn";
    }

    override async run (interaction: ButtonInteraction, bot: Bot): Promise<void> {
        await interaction.showModal(await bot.getModal("reportmdl")!.build([interaction.guild!.id]));
    }
}