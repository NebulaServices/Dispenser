import {Command, CommandOption, Bot, CommandPermissions} from "../classes/Bot";
import {ApplicationCommandOptionType, ChatInputCommandInteraction, /*PermissionsBitField*/} from "discord.js";
import DB, { ButtonType } from "../classes/DB";
import Utils from "../classes/Utils";


export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ephemeral: true});
        if (!/^[a-z0-9]{1,15}$/i.test(interaction.options.getString("name")! as string)) {
            await interaction.editReply(`Invalid group name. (Must under characters long, and only contain letters and numbers)`);
            return;
        }
        if (!/[\w\d\s]{1,80}/.test(interaction.options.getString("label")! as string)) {
            await interaction.editReply(`Invalid group name.`);
            return;
        }
        //if (!/<a?:[a-zA-Z0-9_]+:[0-9]{18}>|<:[a-zA-Z0-9_]+:[0-9]{18}>/.test(interaction.options.getString("emoji")! as string) && interaction.options.getString("emoji")) {
        //    await interaction.editReply(`Invalid emoji.`);
        //    return;
        //}
        try {
            await DB.createGroup(interaction.guild!.id, interaction.options.getString("name")!, interaction.user.id,
                {
                    label: interaction.options.getString("label")!,
                    style: interaction.options.getString("style")! as ButtonType,
                    emoji: interaction.options.getString("emoji")!
                });
        } catch (e) {
            await interaction.editReply({ embeds: [ Utils.getEmbed(0xff0000, { title: `Failed to create group`, description: e!.toString() }) ] });
            return;
        }
        await interaction.editReply({ embeds: [ Utils.getEmbed(0x814fff, { title: `Success`, description: `Created group \`${interaction.options.getString("name")}\`.`}) ]});

        await Utils.sendWebhook(interaction.guildId!, 2, [
            Utils.getEmbed(0x814fff, {
                title: `Group Created`,
                fields: [
                    {
                        name: "Group Name",
                        value: interaction.options.getString("name")!,
                    },
                    {
                        name: "Created By",
                        value: `<@${interaction.user.id}> (${interaction.user.tag} | ${interaction.user.id})`,
                    },
                    {
                        name: "Group Label",
                        value: interaction.options.getString("label")!,
                    },
                    {
                        name: "Group Style",
                        value: interaction.options.getString("style")!,
                    },
                    {
                        name: "Group Emoji",
                        value: interaction.options.getString("emoji")! ?? "None",
                    },
                ]
            })
        ])
    }

    override name(): string {
        return "creategroup";
    }

    override description(): string {
        return "Create a new link group";
    }

    override options(): CommandOption[] {
        return [
            {
                name: "name",
                description: "The name of the group internally",
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: "label",
                description: "The text to display on the button",
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: "style",
                description: "The style of the button",
                type: ApplicationCommandOptionType.String,
                choices: [
                    {
                        name: "Primary",
                        value: "PRIMARY"
                    },
                    {
                        name: "Secondary",
                        value: "SECONDARY"
                    },
                    {
                        name: "Success",
                        value: "SUCCESS"
                    },
                    {
                        name: "Danger",
                        value: "DANGER"
                    }
                ],
                required: true
            },
            {
                name: "emoji",
                description: "The emoji to use for the button",
                type: ApplicationCommandOptionType.String,
                required: false
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