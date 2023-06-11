import {Command, CommandOption, Bot, CommandPermissions} from "../classes/Bot";
import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction
} from "discord.js";
import DB from "../classes/DB";
import Utils from "../classes/Utils";

export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ ephemeral: interaction.options.getBoolean("ephemeral") ?? true});

        switch (interaction.options.getSubcommand()) {
            case "user": {
                let user = interaction.options.get("user")!;
                try {
                    await DB.resetUserUsage(user.user!.id, interaction.guild!.id, interaction.options.getBoolean("dupes") ?? false);
                } catch (e) {
                    await interaction.editReply({ embeds: [ Utils.getEmbed(0xff0000, { title: `Failed to reset user`, description: e!.toString() }) ] });
                    return;
                }
                await interaction.editReply({ embeds: [ Utils.getEmbed(0x814fff, { title: `Success!`, description: `Reset user ${interaction.options.getUser("user")?.tag} \nI reset their usage count${interaction.options.getBoolean("dupes") ? ", and their dupes." : " only."}`}) ]});
                await Utils.sendWebhook(interaction.guild!.id, 2, [
                    Utils.getEmbed(0x814fff, {
                        title: `User Reset`,
                        fields: [
                            {
                                name: "User",
                                value: `<@${user.user!.id}> (${user.user!.tag} | ${user.user!.id})`,
                            },
                            {
                                name: "Reset Dupes",
                                value: interaction.options.getBoolean("dupes") ? "Yes" : "No",
                            },
                            {
                                name: "Reset By",
                                value: `<@${interaction.user.id}> (${interaction.user.tag} | ${interaction.user.id})`,
                            },
                        ]
                    })
                ])
            } break;

            case "all": {
                try {
                    await DB.resetAll(interaction.guild!.id, interaction.options.getBoolean("dupes") ?? false);
                } catch (e) {
                    await interaction.editReply({ embeds: [ Utils.getEmbed(0xff0000, { title: `Failed to reset all users`, description: e!.toString() }) ] });
                    return;
                }

                await interaction.editReply({ embeds: [ Utils.getEmbed(0x814fff, { title: `Success! Reset all users.`, description: `I reset their usage count${interaction.options.getBoolean("dupes") ? ", and reset their dupes." : " only."}`}) ]});

                await Utils.sendWebhook(interaction.guild!.id, 2, [
                    Utils.getEmbed(0x814fff, {
                        title: `All Users Reset`,
                        fields: [
                            {
                                name: "Reset By",
                                value: `<@${interaction.user.id}> (${interaction.user.tag} | ${interaction.user.id})`,
                            },
                            {
                                name: "Reset Dupes",
                                value: interaction.options.getBoolean("dupes") ? "Yes" : "No",
                            }
                        ]
                    })
                ])
            } break;
        }

    }

    override name(): string {
        return "reset";
    }

    override description(): string {
        return "Reset usage";
    }

    override options(): CommandOption[] {
        return [
            {
                name: "user",
                description: "Reset a user",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        type: ApplicationCommandOptionType.User,
                        name: "user",
                        description: "User to reset",
                        required: true
                    },
                    {
                        type: ApplicationCommandOptionType.Boolean,
                        name: "dupes",
                        description: "Allow the user to receive the same domains again.",
                        required: false
                    },
                    {
                        type: ApplicationCommandOptionType.Boolean,
                        name: "ephemeral",
                        description: "Whether the response should be ephemeral or not.",
                        required: false
                    }
                ]
            },
            {
                name: "all",
                description: "Reset all users",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        type: ApplicationCommandOptionType.Boolean,
                        name: "dupes",
                        description: "Allow the users to receive the same domains again.",
                        required: false
                    },
                    {
                        type: ApplicationCommandOptionType.Boolean,
                        name: "ephemeral",
                        description: "Whether the response should be ephemeral or not.",
                        required: false
                    }
                ]
            }
        ];
    }

    override permissions(): CommandPermissions {
        return {
            dmUsable: false,
            adminRole: true,
        }
    }
}