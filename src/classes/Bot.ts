import dotenv from "dotenv";
import fs from "fs";
import { REST } from "@discordjs/rest";
import {
    ActivityOptions,
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonInteraction,
    ChatInputCommandInteraction,
    Client,
    ClientOptions,
    ContextMenuCommandBuilder,
    ContextMenuCommandType,
    MessageContextMenuCommandInteraction,
    ModalBuilder,
    ModalSubmitInteraction,
    PermissionsBitField,
    PresenceStatusData,
    Routes,
    SlashCommandBuilder,
    UserContextMenuCommandInteraction
} from "discord.js";
import DB from "./DB";

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

        if (command.permissions().dmUsable) {
            cmd.setDMPermission(true);
        }

        if (command.permissions().permissions) {
            cmd.setDefaultMemberPermissions(command.permissions().permissions);
        }

        commands.push(cmd);
    }

    let registrars: any = commands.map(command => command.toJSON());
    console.log(`Successfully registered ${commands.length} commands.`);

    const menuObjects: ContextMenu[] = await getMenus();
    const menus: ContextMenuCommandBuilder [] = [];

    for (let menu of menuObjects) {
        let menuBuilder = new ContextMenuCommandBuilder()
            .setName(menu.name())
            .setType(menu.type());

        if (menu.permissions().dmUsable) {
            menuBuilder.setDMPermission(true);
        }

        if (menu.permissions().permissions) {
            menuBuilder.setDefaultMemberPermissions(menu.permissions().permissions);
        }

        menus.push(menuBuilder);
    }

    registrars = menus.map(menu => menu.toJSON()).concat(registrars)

    console.log(`Successfully registered ${menus.length} message menus.`);

    if (process.env.GUILD_ID) {
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!), { body: registrars });
    } else {
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), { body: registrars });
    }


}

init()

async function getCommands(): Promise<Command[]> {
    const commands: Command[] = [];
    const commandFiles = fs.readdirSync('./src/commands/');

    const importPromises = commandFiles.map(async (file) => {
        if (file.endsWith('.ts')) {
            const imports = await import(`../commands/${file}`);
            const command = new imports.default();
            commands.push(command);
        } else if ((await fs.statSync(`./src/commands/${file}`)).isDirectory()) {
            const subFiles = fs.readdirSync(`./src/commands/${file}`);
            const subFilePromises = subFiles.map(async (subFile) => {
                if (subFile.endsWith('.ts')) {
                    const imports = await import(`../commands/${file}/${subFile}`);
                    const command = new imports.default();
                    commands.push(command);
                }
            });
            await Promise.all(subFilePromises);
        }
    });

    await Promise.all(importPromises);
    return commands;
}

async function getMenus(): Promise<ContextMenu[]> {
    let menus: ContextMenu[] = [];

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

export interface CommandPermissions {
    dmUsable?: boolean;
    permissions?: bigint;
    adminRole?: boolean;
    adminPermissionBypass?: boolean;
}



export abstract class Command {
    abstract run(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void>;

    abstract name(): string;
    abstract description(): string;
    options(): CommandOption[] { return []; }
    abstract permissions(): CommandPermissions;
}

export abstract class ContextMenu {
    abstract run(interaction: MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction, bot: Bot): Promise<void>;

    abstract name(): string;

    abstract type(): ContextMenuCommandType;

    abstract permissions(): CommandPermissions;
}

export abstract class Button {
    abstract run(interaction: ButtonInteraction, bot: Bot): Promise<void>;

    abstract build(args?: string[]): Promise<ButtonBuilder>;
    abstract id(args?: string[]): string;
    abstract permissions(): CommandPermissions;
}


export abstract class Modal {
    abstract run(interaction: ModalSubmitInteraction, bot: Bot): Promise<void>;
    abstract name(): string;
    abstract build(args?: string[]): Promise<ModalBuilder>;
    abstract id(): string;
}


export class Bot {
    constructor(token: string, intents: ClientOptions, status: PresenceStatusData, activity: ActivityOptions) {
        this.client = new Client(intents);
        Bot.client = this.client;
        this.initCommands();

        this.client.on("interactionCreate", async interaction => {
            if (interaction.isChatInputCommand()) {
                const command: Undefinable<Command> = this.commands.find(command => command.name() === interaction.commandName);
                if (command) {
                    if (this.cooldowns.has(interaction.user.id)) {
                        const cooldown = this.cooldowns.get(interaction.user.id);
                        if (cooldown!.time > Date.now() && cooldown!.command === command.name()) {
                            const remainingTime = ((cooldown!.time - Date.now()) / 1000).toFixed(1);
                            interaction.reply({
                                content: `You must wait **${remainingTime}**s before using this command again.\nYour cooldown: **${parseInt(process.env.COOLDOWN_TIME!) / 1000}**s`,
                                ephemeral: true,
                            });
                            return;
                        }
                    }

                    if (command.permissions().adminRole) {
                        const roles = await (await (await this.client.guilds.fetch(interaction.guildId!)).members.fetch(interaction.user.id)).roles.cache;
                        if (!roles.some(role => this.adminRoles.get(interaction.guildId!)?.includes(role.id))) {
                            if (command.permissions().adminPermissionBypass) {
                                let member = await (await (await this.client.guilds.fetch(interaction.guildId!)).members.fetch(interaction.user.id));
                                if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                                    interaction.reply({ content: "This command is restricted to admin users, or users with admin permission.", ephemeral: true });
                                    return;
                                }
                            } else {
                                interaction.reply({ content: "This command is restricted to admin users.", ephemeral: true });
                                return;
                            }
                        }
                    }
                    await command
                        .run(interaction, this)
                        .catch((error) => {
                            console.error("Error executing command:", error);
                            interaction.reply("An error occurred while executing the command.");
                        });

                    const cooldownTime = process.env.COOLDOWN_TIME ? parseInt(process.env.COOLDOWN_TIME) : 1000;

                    const cooldown = {
                        time: Date.now() + cooldownTime,
                        command: interaction.commandName,
                    };

                    this.cooldowns.set(interaction.user.id, cooldown);

                    setTimeout(() => {
                        this.cooldowns.delete(interaction.user.id);
                    }, cooldownTime);
                } else {
                    interaction.reply({ content: "Command not found", ephemeral: true });
                }
            } else if (interaction.isUserContextMenuCommand() || interaction.isMessageContextMenuCommand()) {
                const menu: Undefinable<ContextMenu> = this.ctxmenus.find(menu => menu.name() === interaction.commandName);

                if (menu) {
                    if (menu.permissions().adminRole) {
                        const roles = await (await (await this.client.guilds.fetch(interaction.guildId!)).members.fetch(interaction.user.id)).roles.cache;
                        if (!roles.some(role => this.adminRoles.get(interaction.guildId!)?.includes(role.id))) {
                            interaction.reply({ content: "This action is restricted to admin users.", ephemeral: true });
                            return;
                        }
                    }
                    menu
                        .run(interaction, this)
                        .catch((error) => {
                            console.error("Error executing menu:", error);
                            interaction.reply("An error occurred while executing the context menu.");
                        });
                } else {
                    interaction.reply({ content: "Menu not found", ephemeral: true });
                }
            }  else if (interaction.isButton()) {
                const button: Undefinable<Button> = this.buttons.find((button) => button.id().startsWith(interaction.customId.split("-")[0]!));
                if (button) {
                        if (this.cooldowns.has(interaction.user.id)) {
                            const cooldown = this.cooldowns.get(interaction.user.id);
                            if (cooldown!.time > Date.now()) {
                                //const remainingTime = Math.ceil((cooldown!.time - Date.now()) / 1000);
                                const remainingTime = ((cooldown!.time - Date.now()) / 1000).toFixed(1);
                                interaction.reply({
                                    content: `You must wait **${remainingTime}**s before using this button again.\nYour cooldown: **${parseInt(process.env.COOLDOWN_TIME!) / 1000}**s`,
                                    ephemeral: true,
                                });
                                return;
                            }
                        }
                    if (button.permissions().adminRole) {
                        const roles = await (await (await this.client.guilds.fetch(interaction.guildId!)).members.fetch(interaction.user.id)).roles.cache;
                        if (!roles.some(role => this.adminRoles.get(interaction.guildId!)?.includes(role.id))) {
                            interaction.reply({ content: "This action is restricted to admin users.", ephemeral: true });
                            return;
                        }
                    }
                    button
                        .run(interaction, this)
                        .catch((error) => {
                            console.error("Error executing button:", error);
                            interaction.reply("An error occurred while executing the button.");
                        });

                    const cooldownTime = process.env.COOLDOWN_TIME ? parseInt(process.env.COOLDOWN_TIME) : 1000;
                    const cooldown = {
                        time: Date.now() + cooldownTime,
                        command: interaction.customId.split("-")[0]!,
                    };
                    this.cooldowns.set(interaction.user.id, cooldown);

                    setTimeout(() => {
                        this.cooldowns.delete(interaction.user.id);
                    }, cooldownTime);
                } else {
                    interaction.reply({ content: "Button not found", ephemeral: true });
                }
            } else if (interaction.isModalSubmit()) {
                const modal: Undefinable<Modal> = this.modals.find((modal) => modal.id() === interaction.customId);

                if (modal) {
                    modal
                        .run(interaction, this)
                        .catch((error) => {
                            console.error("Error executing modal:", error);
                            interaction.reply("An error occurred while executing the modal.");
                        });
                } else {
                    interaction.reply("Modal not found");
                }
            }
        });

        this.client.login(token);

        this.client.on("ready", async () => {
            await this.client.user?.setPresence({ status: status, activities: [activity] });
            await this.setAdminRoles();
        })
    }

    public async setAdminRoles(): Promise<void> {
        this.adminRoles = await DB.getAdminRoles();
    }

    public async initCommands(): Promise<void> {
        this.commands = await getCommands();
        this.ctxmenus = await getMenus();
        this.buttons = await getButtons();
        this.modals = await getModals();
    }

    getButton (id: string, args?: string[]): Undefinable<Button> {
        return this.buttons.find(button => button.id(args)?.startsWith(id));
    }

    getModal (id: string): Undefinable<Modal> {
        return this.modals.find(modal => modal.id() === id);
    }

    client: Client<true>;
    static client: Client;
    commands: Command[] = [];
    ctxmenus: ContextMenu[] = [];
    buttons: Button[] = [];
    modals: Modal[] = [];
    adminRoles: Map<string, string[]> = new Map(); // guild id, role ids
    cooldowns: Map<string, { command: string, time: number }> = new Map();
}