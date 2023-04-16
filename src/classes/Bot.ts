import dotenv from "dotenv";
import fs from "fs";
import {REST} from "@discordjs/rest";
import {
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonInteraction,
    Client,
    ClientOptions,
    CommandInteraction,
    ContextMenuCommandBuilder,
    ContextMenuCommandType,
    MessageContextMenuCommandInteraction, ModalBuilder, ModalSubmitInteraction,
    Routes,
    SlashCommandBuilder
} from "discord.js";


dotenv.config();
export type Undefinable<T> = T | undefined;

function addOptions (option: CommandOption, cmd: SlashCommandBuilder) {
    switch (option.type) {
        case ApplicationCommandOptionType.Attachment:  { cmd.addAttachmentOption(out => out.setName(option.name).setDescription(option.description).setRequired(option.required!));  break; }
        case ApplicationCommandOptionType.Boolean:     { cmd.addBooleanOption(out => out.setName(option.name).setDescription(option.description).setRequired(option.required!));     break; }
        case ApplicationCommandOptionType.Channel:     { cmd.addChannelOption(out => out.setName(option.name).setDescription(option.description).setRequired(option.required!));     break; }
        case ApplicationCommandOptionType.Integer:     { cmd.addIntegerOption(out => out.setName(option.name).setDescription(option.description).setRequired(option.required!));     break; }
        case ApplicationCommandOptionType.Mentionable: { cmd.addMentionableOption(out => out.setName(option.name).setDescription(option.description).setRequired(option.required!)); break; }
        case ApplicationCommandOptionType.Role:        { cmd.addRoleOption(out => out.setName(option.name).setDescription(option.description).setRequired(option.required!));        break; }
        case ApplicationCommandOptionType.User:        { cmd.addUserOption(out => out.setName(option.name).setDescription(option.description).setRequired(option.required!));        break; }
        case ApplicationCommandOptionType.String: {
            if (option.choices) {
                cmd.addStringOption(out => out.setName(option.name).setDescription(option.description).setRequired(option.required!).addChoices(...<[]>option.choices));
            }
            else {
                cmd.addStringOption(out => out.setName(option.name).setDescription(option.description).setRequired(option.required!));
            }
            break;
        }
        default: break;
    }
}

async function init(): Promise<void> {

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN as never);

    const commandObjects: Command[] = await getCommands();
    const commands: SlashCommandBuilder[] = [];

    for (let command of commandObjects) {
        const cmd = new SlashCommandBuilder().setName(command.name()).setDescription(command.description());

        for (let option of command.options()) {
            addOptions(option, cmd);
        }

        if (command.DMUsable) {
            cmd.setDMPermission(true);
        }

        commands.push(cmd);
    }

    let registrars: any = commands.map(command => command.toJSON());
    console.log(`Successfully registered ${commands.length} commands.`);

    const menuObjects: MessageMenu[] = await getMenus();
    const menus: ContextMenuCommandBuilder [] = [];

    for (let menu of menuObjects) {
        menus.push(new ContextMenuCommandBuilder().setName(menu.name()).setType(menu.type()));
    }

    registrars = menus.map(menu => menu.toJSON()).concat(registrars)

    console.log(`Successfully registered ${menus.length} message menus.`);

    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!), { body: registrars });

} init()


async function getCommands(): Promise<Command[]> {
    let commands: Command[] = [];

    for (let file of fs.readdirSync(`./src/commands/`).filter(file => file.endsWith(".ts"))) {
        let imports = await import(`../commands/${file}`);

        let command = new imports.default();
        commands.push(command);
    }

    for (let file of fs.readdirSync(`./src/commands/`).filter(file => fs.statSync(`./src/commands/${file}`).isDirectory())) {
        for (let subfile of fs.readdirSync(`./src/commands/${file}`).filter(file => file.endsWith(".ts"))) {
            let imports = await import(`../commands/${file}/${subfile}`);

            let command = new imports.default();
            commands.push(command);
        }
    }

    return commands;
}

async function getMenus(): Promise<MessageMenu[]> {
    let menus: MessageMenu[] = [];

    for (let file of fs.readdirSync("./src/menus/").filter(file => file.endsWith(".ts"))) {
        let imports = await import(`../menus/${file}`);

        let menu = new imports.default();
        menus.push(menu);
    }
    return menus;
}

async function getButtons(): Promise<Button[]> {
    let buttons: Button[] = [];

    for (let file of fs.readdirSync("./src/buttons/").filter(file => file.endsWith(".ts"))) {
        let imports = await import(`../buttons/${file}`);

        let button = new imports.default();
        buttons.push(button);
    }
    return buttons;
}

async function getModals(): Promise<Modal[]> {
    let modals: Modal[] = [];

    for (let file of fs.readdirSync("./src/modals/").filter(file => file.endsWith(".ts"))) {
        let imports = await import(`../modals/${file}`);

        let modal = new imports.default();
        modals.push(modal);
    }
    return modals;
}


export interface CommandOption {

    type: ApplicationCommandOptionType
    name: string;
    description: string;
    required?: boolean;
    options?: CommandOption[];
    choices?: {
        name: string, value: string
    }[];
}


export abstract class Command {
    abstract run(interaction: CommandInteraction, bot: Bot): Promise<void>;

    abstract name(): string;
    abstract description(): string;
    DMUsable?(): boolean { return false; }
    options(): CommandOption[] { return []; }
}

export abstract class MessageMenu {
    abstract run(interaction: MessageContextMenuCommandInteraction, bot: Bot): Promise<void>;

    abstract name(): string;
    abstract type(): ContextMenuCommandType;
}

export abstract class Button {
    abstract run(interaction: ButtonInteraction, bot: Bot): Promise<void>;

    abstract build(): ButtonBuilder;
    abstract id(): string;
}

export abstract class Modal {
    abstract run(interaction: ModalSubmitInteraction, bot: Bot): Promise<void>;
    abstract name(): string;

    abstract build(args?: string[]): ModalBuilder;
    abstract id(): string;
}
export class Bot {


    constructor(token: string, intents: ClientOptions, status: string) {
        this.client = new Client(intents);

        this.initCommands();

        this.client.on("interactionCreate", async interaction => {
            if (interaction.isChatInputCommand()) {
                const command: Undefinable<Command> = this.commands.find(command => command.name() === interaction.commandName);

                if (command) {
                    await command.run(interaction, this);
                } else {
                    await interaction.reply("Command not found");
                }
            } else if (interaction.isMessageContextMenuCommand()) {
                const menu: Undefinable<MessageMenu> = this.msgmenus.find(menu => menu.name() === interaction.commandName);

                if (menu) {
                    await menu.run(interaction, this);
                } else {
                    await interaction.reply("Menu not found");
                }
            } else if (interaction.isButton()) {
                const button: Undefinable<Button> = this.buttons.find(button => button.id() === interaction.customId);

                if (button) {
                    await button.run(interaction, this);
                } else {
                    await interaction.reply("Button not found");
                }
            } else if (interaction.isModalSubmit()) {
                const modal: Undefinable<Modal> = this.modals.find(modal => modal.id() === interaction.customId);

                if (modal) {
                    await modal.run(interaction, this);
                } else {
                    await interaction.reply("Modal not found");
                }
            }
        });

        this.client.login(token);

        this.client.on("ready", () => {
            this.client.user?.setActivity(status);

        });
    }
    private async initCommands(): Promise<void> {
        this.commands = await getCommands();
        this.msgmenus = await getMenus();
        this.buttons = await getButtons();
        this.modals = await getModals();
    }

    getButton(id: string): Undefinable<Button> {
        return this.buttons.find(button => button.id() === id);
    }

    getModal (id: string): Undefinable<Modal> {
        return this.modals.find(modal => modal.id() === id);
    }

    client: Client;
    commands: Command[] = [];
    msgmenus: MessageMenu[] = [];
    buttons: Button[] = [];
    modals: Modal[] = [];
}