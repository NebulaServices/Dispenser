import {Command, CommandOption, Bot, CommandPermissions} from "../classes/Bot";
import { ApplicationCommandOptionType, ChatInputCommandInteraction} from "discord.js";
import DB from "../classes/DB";
import Utils from "../classes/Utils";

export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ephemeral: interaction.options.getBoolean("ephemeral") ?? true});
        try {
            await DB.resetAll(interaction.guild!.id, interaction.options.getBoolean("dupes") ?? false);
        } catch (e) {
            await interaction.editReply({ embeds: [ Utils.getEmbed(0xff0000, { title: `Failed to reset all users`, description: e!.toString() }) ] });
            return;
        }

        await interaction.editReply({ embeds: [ Utils.getEmbed(0x702963, { title: `Success! Reset all users.`, description: `I reset their usage count${interaction.options.getBoolean("dupes") ? ", and reset their dupes." : " only."}`}) ]});

        await Utils.sendWebhook(interaction.guild!.id, 2, [
            Utils.getEmbed(0x702963, {
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
    }

    override name(): string {
        return "resetall";
    }

    override description(): string {
        return "Reset every user in the DB.";
    }

    override options(): CommandOption[] {
        return [
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
        ];
    }

    override permissions(): CommandPermissions {
        return {

        }
    }
}