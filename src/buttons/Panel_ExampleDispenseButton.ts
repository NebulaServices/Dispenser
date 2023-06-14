import { Button, Bot, CommandPermissions } from "../classes/Bot";
import { ButtonInteraction, ButtonBuilder, ButtonStyle } from "discord.js";


function convertPrismaEnumToButtonStyle(prismaEnum: string): ButtonStyle {
    switch (prismaEnum) {
        case 'PRIMARY':   return ButtonStyle.Primary;
        case 'SECONDARY': return ButtonStyle.Secondary;
        case 'SUCCESS':   return ButtonStyle.Success;
        case 'DANGER':    return ButtonStyle.Danger;
        default:          return ButtonStyle.Primary;
    }
}

export default class extends Button {
    override async build(args: string[]): Promise<ButtonBuilder> {
        if (!args) {
            return new ButtonBuilder()
                .setLabel("Dispense")
                .setDisabled(true)
                .setStyle(ButtonStyle.Primary)

        }

        let buttonBuilder = new ButtonBuilder()
            .setLabel(args[0]!)
            .setCustomId(this.id())
            .setStyle(ButtonStyle.Primary)
            .setStyle(convertPrismaEnumToButtonStyle(args[1] as string))


        if (args[2]) {
            try {
                buttonBuilder.setEmoji(args[2]!)
            } catch (e) {
                console.log(e);
            }
        }

        return buttonBuilder
    }

    override id(): string {
        return "panelexampledispensebtn";
    }

    override async run(interaction: ButtonInteraction, bot: Bot): Promise<any> {
        await interaction.deferUpdate();
    }

    override permissions(): CommandPermissions {
        return {
            adminRole: false,
        }
    }
}
