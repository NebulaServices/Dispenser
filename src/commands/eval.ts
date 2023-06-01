import { Command, CommandOption, Bot, CommandPermissions } from "../classes/Bot";
import {ApplicationCommandOptionType, ChatInputCommandInteraction} from "discord.js";

export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        //await interaction.deferReply();
        if (interaction.user.id !== process.env.OWNER_ID) {
            await interaction.reply("No");
            return;
        } else {
            await interaction.showModal(await bot.getModal("eval")!.build([interaction.guild!.id]));
        }
    }

    override name(): string {
        return "eval";
    }

    override description(): string {
        return "Evaluate code";
    }

    override options(): CommandOption[] {
        return [
            {
                name: "options",
                description: "WsadADasdasdasd",
                type: ApplicationCommandOptionType.SubcommandGroup,
                options: [
                    {
                        name: "eval",
                        description: "Evaluate code",
                        type: ApplicationCommandOptionType.Subcommand,
                    },
                    {
                        name: "exec",
                        description: "Execute code",
                        type: ApplicationCommandOptionType.Subcommand,
                    }
                ]
            },
            {
                name: "ddddd",
                description: "Code to evaluate",
                type: ApplicationCommandOptionType.SubcommandGroup,
                options: [
                    {
                        name: "alacfknbarns",
                        description: "Code to evaluate",
                        type: ApplicationCommandOptionType.Subcommand,
                    },
                    {
                        name: "codasdadasdasde",
                        description: "Code to execute",
                        type: ApplicationCommandOptionType.Subcommand,
                    },
                ]
            }
        ];
    }
    override permissions(): CommandPermissions {
        return {
            //permissions: PermissionsBitField.Flags.ManageMessages, // The permissions the user needs to run the command as a bigint
            dmUsable: true // Whether the command can be ran in dms via global cmds
        }
    }
}