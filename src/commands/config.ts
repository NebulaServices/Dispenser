import {Command, CommandOption, Bot, CommandPermissions} from "../classes/Bot";
import {
    ActionRowBuilder, ApplicationCommandOptionType,
    ButtonBuilder,
    ChatInputCommandInteraction
} from "discord.js";

export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply();
        await interaction.editReply({
            embeds: [
                {
                    title: "Configuration Panel",
                    description: "This is the admin configuration panel.\nYou can configure the bot using the buttons below.",
                    fields: [
                        {
                            name: "Help",
                            value: "Configure the webhook used to send messages to the channel."
                        }
                    ]
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
        return [
            {
                name: "ephemeral",
                description: "Whether or not the message should be ephemeral.",
                type: ApplicationCommandOptionType.Boolean,
                required: false
            }
        ];
    }

    override permissions(): CommandPermissions {
        return {
            dmUsable: false,
            adminRole: true
        }
    }
}