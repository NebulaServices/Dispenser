import {Command, CommandOption, Bot, CommandPermissions} from "../classes/Bot";
import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    /*PermissionsBitField*/
} from "discord.js";
import DB from "../classes/DB";
import Utils from "../classes/Utils";

export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ephemeral: true});
        try {
            await DB.deleteDomain(interaction.guildId!, interaction.options.getString("domain")!, interaction.options.getString("group")!);
        } catch (e) {
            await interaction.editReply({ embeds: [ Utils.getEmbed(0xff0000, { title: `Failed to delete`, description: e!.toString() }) ] });
            return;
        }
        await interaction.editReply({ embeds: [ Utils.getEmbed(0x702963, { title: `Success`, description: `Removed <${interaction.options.getString("domain")}> from group \`${interaction.options.getString("group")}\`.`}) ]});
    }

    override name(): string {
        return "removelink";
    }

    override description(): string {
        return "Remove a link from the bot";
    }

    override options(): CommandOption[] {
        return [{
            name: "domain",
            description: "The domain to remove",
            type: ApplicationCommandOptionType.String,
            required: true
        },
            {
                name: "group",
                description: "The group to the domain is in",
                type: ApplicationCommandOptionType.String,
                required: true
            }]
    }

    override permissions(): CommandPermissions {
        return {
            dmUsable: false,
            //permissions: PermissionsBitField.Flags.ManageGuild,
        }
    }

}