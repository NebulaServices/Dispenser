import { Command, CommandOption, Bot, CommandPermissions } from "../classes/Bot";
import { ChatInputCommandInteraction} from "discord.js";

export default class extends Command {
    override async run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void> {
        //await interaction.deferReply();
        if (interaction.user.id !== process.env.OWNER_ID) {
            await interaction.reply({ ephemeral: true, content: "No" });
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
        ];
    }
    override permissions(): CommandPermissions {
        return {
            dmUsable: true
        }
    }
}