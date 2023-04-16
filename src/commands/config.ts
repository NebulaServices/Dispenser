import { Command, CommandOption, Bot } from "../classes/Bot";
import { ActionRowBuilder, ButtonBuilder, CommandInteraction } from "discord.js";
import s from "../assets/en_US.json" assert { type: "json" };
let m = s.strings.config;
export default class extends Command {
    override async run(interaction: CommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply();
        await interaction.editReply({
            embeds: [
                {
                    title: m.embed_title
                }
            ],
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents([bot.getButton("btnconfigeditwebhook")?.build()!, bot.getButton("btnconfigeditbuttonstyle")?.build()!, bot.getButton("btnconfigeditusagebtn")?.build()!])
            ]
        });
    }

    override name(): string {
        return "config";
    }

    override description(): string {
        return "Configuration";
    }

    override options(): CommandOption[] {
        return [];
    }
}