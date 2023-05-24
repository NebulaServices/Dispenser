import {Command, CommandOption, Bot, CommandPermissions} from "../classes/Bot";
import {ApplicationCommandOptionType, ChatInputCommandInteraction, /*PermissionsBitField*/} from "discord.js";
import DB from "../classes/DB";
import Utils from "../classes/Utils";


export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ephemeral: true});
        if (interaction.options.getInteger("limit")! < 1 || interaction.options.getInteger("limit")! > 99) {
            await interaction.editReply({ embeds: [ Utils.getEmbed(0xff0000, { title: `Failed to add role`, description: `Limit must be between 1 and 99.` }) ] });
            return;
        }
        try {
            await DB.createRole(interaction.guildId!, interaction.options.getRole("role")!.id, interaction.options.getInteger("limit") as number)
        } catch (e) {
            await interaction.editReply({ embeds: [ Utils.getEmbed(0xff0000, { title: `Failed to add role`, description: e!.toString() }) ] });
            return;
        }
        await interaction.editReply({ embeds: [ Utils.getEmbed(0x814fff, { title: `Success`, description: `Added role <@&${interaction.options.getRole("role")!.id}> with limit of ${interaction.options.getInteger("limit")}.`}) ]});

        await Utils.sendWebhook(interaction.guild!.id, 2, [
            Utils.getEmbed(0x814fff, {
                title: `Role Added`,
                fields: [
                    {
                        name: "Role",
                        value: `<@&${interaction.options.getRole("role")!.id}>`,
                    },
                    {
                        name: "Created By",
                        value: `<@${interaction.user.id}> (${interaction.user.tag} | ${interaction.user.id})`,
                    },
                    {
                        name: "Special Limit",
                        value: interaction.options.getInteger("limit")!.toString(),
                    }
                ]
            })
        ])
    }

    override name(): string {
        return "addrole";
    }

    override description(): string {
        return "Add a custom role.";
    }

    override options(): CommandOption[] {
        return [
            {
                name: "role",
                description: "The role you want to add",
                type: ApplicationCommandOptionType.Role,
                required: true
            },
            {
                name: "limit",
                description: "The new domain limit for this role",
                type: ApplicationCommandOptionType.Integer,
                required: true,
            }
        ]
    }

    override permissions(): CommandPermissions {
        return {
            dmUsable: false,
            //permissions: PermissionsBitField.Flags.ManageGuild,
        }
    }

}