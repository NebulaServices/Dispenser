import {Bot, CommandPermissions, SelectMenu} from "../classes/Bot";
import {
    SelectMenuInteraction, SelectMenuBuilder, StringSelectMenuBuilder,
} from "discord.js";

export default class extends SelectMenu {
    override async run(interaction: SelectMenuInteraction, bot: Bot): Promise<void> {
        await interaction.deferUpdate();
        await interaction.editReply({ content: `You selected ${interaction.values[0]}` })
    }

    override name(): string {
        return "Test Menu";
    }

    override id(): string {
        return "testmenu";
    }

    override build(): Promise<StringSelectMenuBuilder> {
        return Promise.resolve(new SelectMenuBuilder()
            .setCustomId(this.id())
            .setPlaceholder("Select an option")
            .addOptions([
                {
                    label: "Option 1",
                    value: "option1",
                    default: true,
                },
                {
                    label: "Option 2",
                    value: "option2",
                },
            ]));
    }

    override permissions(): CommandPermissions {
        return {
            //permissions: PermissionsBitField.Flags.BanMembers,
            dmUsable: false,
            adminRole: true,
        }
    }
}