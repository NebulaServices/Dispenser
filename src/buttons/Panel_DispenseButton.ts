import { Button, Bot } from "../classes/Bot";
import {ButtonInteraction, ButtonBuilder, /*Message,*/} from "discord.js";
//import DB from "../classes/DB";

export default class extends Button {
    override build(): ButtonBuilder {
        return new ButtonBuilder()
            .setLabel("Dispense")
            .setCustomId(this.id());
    }

    override id(): string {
        return "paneldispensebtn";
    }

    override async run (interaction: ButtonInteraction, bot: Bot): Promise<any> {
        // await interaction.deferReply({ephemeral: true})
        // let response = await DB.getDomain(interaction.guild!.id, interaction.user.id)!;
        // let m: Message;
        // switch (response.type) {
        //     case "error": {
        //         return interaction.editReply({
        //             embeds: [
        //                 {
        //                     title: "I couldn't provide you with a domain.",
        //                     description: response.text
        //                 }
        //             ]
        //         })
        //     }
        //     case "success": {
        //         try {
        //             m = await interaction.user.send({embeds: [{
        //                     title: "Here's your Link!",
        //                     description: response.domain,
        //                     fields: [
        //                         {
        //                             name: "Usage",
        //                             value: response.text
        //                         }
        //                     ]
        //                 }]});
        //         } catch (e) {
        //             console.log(e);
        //             return interaction.editReply({
        //                 embeds: [
        //                     {
        //                         title: "Couldn't message you. Enable DMs and try again.",
        //                         image: {
        //                             url: "https://media.discordapp.net/attachments/1083220678624411738/1091536310377922611/DiscordCanary_MM7anpQmHc.png"
        //                         }
        //                     }
        //                 ]})
        //         }
        //     }
        // }
        //
        // await interaction.editReply({
        //     content: `Check your DMs. \[[Jump to message](\<${m!.url}\>)\]`,
        // })
    }
}