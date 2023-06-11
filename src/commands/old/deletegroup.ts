import {Command, CommandOption, Bot, CommandPermissions} from "../../classes/Bot";
import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
} from "discord.js";
import DB from "../../classes/DB";
import Utils from "../../classes/Utils";


export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ephemeral: true});
        try {
            await DB.deleteGroup(interaction.guild!.id, interaction.options.getString("name")!);
        } catch (e) {
            await interaction.editReply({ embeds: [ Utils.getEmbed(0xff0000, { title: `Failed to delete group`, description: e!.toString() }) ] });
            return;
        }
        await interaction.editReply({ embeds: [ Utils.getEmbed(0x814fff, { title: `Success`, description: `Deleted group \`${interaction.options.getString("name")}\`.`}) ]});

        await Utils.sendWebhook(interaction.guildId!, 2, [
            Utils.getEmbed(0x814fff, {
                title: `Group Deleted`,
                fields: [
                    {
                        name: "Group Name",
                        value: interaction.options.getString("name")!,
                    },
                    {
                        name: "Deleted By",
                        value: `<@${interaction.user.id}> (${interaction.user.tag} | ${interaction.user.id})`,
                    },
                ]
            })
        ])
    }

    override name(): string {
        return "deletegroup";
    }

    override description(): string {
        return "Delete a group. THIS WILL DELETE ALL LINKS IN THE GROUP!";
    }

    override options(): CommandOption[] {
        return [
            {
                name: "name",
                description: "The name of the group internally",
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    }

    override permissions(): CommandPermissions {
        return {
            dmUsable: false,
            adminRole: true,
        }
    }

}