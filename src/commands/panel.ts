import {Command, CommandOption, Bot, CommandPermissions} from "../classes/Bot";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ChatInputCommandInteraction
} from "discord.js";
import Utils from "../classes/Utils";
import DB from "../classes/DB";

export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        await interaction.deferReply({ ephemeral: true });
        let groups = await DB.getGroups(interaction.guild!.id);
        let rows: ActionRowBuilder<ButtonBuilder>[] = []; // Change variable name to "rows" instead of "row"
        let buttons: ButtonBuilder[] = [];

        for (const group of groups) {
            buttons.push(await bot.getButton("paneldispensebtn", [group.groupId])?.build([group.groupId, group.buttonLabel, group.buttonType, group.buttonEmoji])!);
        }

        if ((await DB.doesWebhookUrlsExist(interaction.guild!.id)).reports) {
            buttons.push(await bot.getButton("panelreportbtn")?.build()!);
        }

        while (buttons.length > 0) {
            const rowButtons = buttons.splice(0, 5);
            rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(...rowButtons));
        }

        let msg = await interaction.channel!.send({
            embeds: [
                Utils.getEmbed(0x814fff, {
                    title: "Dispenser",
                    description: "Click the buttons below to dispense items.",
                }),
            ],
            components: rows,
        });



        await interaction.editReply({
            content: `Panel Created! \[[Link](\<${msg.url}\>)\]`,
        })

        await Utils.sendWebhook(interaction.guildId!, 2, [
            Utils.getEmbed(0x814fff, {
                title: `Panel Created`,
                fields: [
                    {
                        name: "Created By",
                        value: `<@${interaction.user.id}> (${interaction.user.tag} | ${interaction.user.id})`,
                    }
                    ],
                description: `[Link](\<${msg.url}\>)`,
            })
        ])
    }

    override name(): string {
        return "panel";
    }

    override description(): string {
        return "Create a dispenser panel";
    }


    override options(): CommandOption[] {
        return []
    }

    override permissions(): CommandPermissions {
        return {
            dmUsable: false,
            adminRole: true,
        }
    }
}