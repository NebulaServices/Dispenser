import {Command, CommandOption, Bot, CommandPermissions} from "../classes/Bot";
import {
    ActionRowBuilder, ApplicationCommandOptionType,
    ButtonBuilder,
    ChatInputCommandInteraction
} from "discord.js";
import Utils from "../classes/Utils";

export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ ephemeral: interaction.options.getBoolean("ephemeral") ?? true });
        await interaction.editReply({
            embeds: [
                Utils.getEmbed(Utils.EmbedType.Coffee, {
                    title: "Configuration Panel",
                    description: "This is the admin configuration panel.\nYou can configure the bot using the buttons below.",
                    fields: [
                        {
                            name: "View Information",
                            value: "[Github](https://github.com/NebulaServices/Dispenser) | [Docs](https://nebulaservices.github.io/Dispenser/) "
                        },
                        {
                            name: "Edit Webhook URLs",
                            value: "Configure the webhooks used to log actions and send reports.",
                            inline: true
                        },
                        {
                            name: "Edit Usage",
                            value: "Configure the default amount of links a user can dispense without a custom role.",
                            inline: true
                        }
                    ],
                    footer: {
                        text: "Dispenser is a Nebula Service",
                        iconURL: "https://cdn.nsmbu.net/dispenser/ndl.png"
                    }
                })
            ],
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents([
                        await bot.getButton("btnconfigeditwebhook")?.build()!,
                        await bot.getButton("btnconfigeditusage")?.build()!
                    ])
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