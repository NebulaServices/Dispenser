import {Command, CommandOption, Bot, CommandPermissions} from "../classes/Bot";
import {ActionRowBuilder, ButtonBuilder, ChatInputCommandInteraction } from "discord.js";

export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply();
        await interaction.editReply({
            embeds: [
                {
                    title: "Configuration Panel",
                    description: "Configure the bot using the buttons below."
                }
            ],
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents([await bot.getButton("btnconfigeditwebhook")?.build()!, await bot.getButton("btnconfigeditusagebtn")?.build()!])
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

    override permissions(): CommandPermissions {
        return {}
    }
}