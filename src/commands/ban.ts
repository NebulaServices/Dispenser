import {Command, CommandOption, Bot, CommandPermissions} from "../classes/Bot";
import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
} from "discord.js";
import DB from "../classes/DB";
import Utils from "../classes/Utils";

export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ ephemeral: interaction.options.getBoolean("ephemeral") ?? true });
        try {
            await DB.banUser(interaction.options.getUser("user")!.id, interaction.guildId!);
        } catch (e) {
            await interaction.editReply({ embeds: [ Utils.getEmbed(Utils.EmbedType.Red, { title: `Failed to ban user`, description: e!.toString() }) ] });

            await Utils.sendWebhook(interaction.guildId!, Utils.WebhookType.Logs, [
                Utils.getEmbed(Utils.EmbedType.Red, {
                    title: `Failed to ban user`,
                    fields: [
                        {
                            name: "User",
                            value: `<@${interaction.options.getUser("user")?.id}> (${interaction.options.getUser("user")?.tag} | ${interaction.options.getUser("user")?.id})`,
                        },
                        {
                            name: "Banned By",
                            value: `<@${interaction.user.id}> (${interaction.user.tag} | ${interaction.user.id})`,
                        },
                        {
                            name: "Ban Method",
                            value: "Command"
                        },
                        {
                            name: "Error",
                            value: e!.toString()
                        }
                    ]
                })
            ])

            return;
        }

        await interaction.editReply({ embeds: [ Utils.getEmbed(Utils.EmbedType.Purple, { title: `Success!`, description: `Banned user <@${interaction.options.getUser("user")?.id}> (${interaction.options.getUser("user")?.tag})`}) ]});

        await Utils.sendWebhook(interaction.guildId!, Utils.WebhookType.Logs, [
            Utils.getEmbed(Utils.EmbedType.Purple, {
                title: `User Banned`,
                fields: [
                    {
                        name: "User",
                        value: `<@${interaction.options.getUser("user")?.id}> (${interaction.options.getUser("user")?.tag} | ${interaction.options.getUser("user")?.id})`,
                    },
                    {
                        name: "Banned By",
                        value: `<@${interaction.user.id}> (${interaction.user.tag} | ${interaction.user.id})`,
                    },
                    {
                        name: "Ban Method",
                        value: "Command"
                    }
                ]
            })
        ])
    }



    override name(): string {
        return "ban";
    }

    override description(): string {
        return "Ban a user from using the bot.";
    }

    override options(): CommandOption[] {
        return [
            {
                name: "user",
                description: "The user to ban",
                type: ApplicationCommandOptionType.User,
                required: true
            },
            {
                name: "ephemeral",
                description: "Whether the response should be ephemeral or not.",
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