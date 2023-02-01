import { CommandInteraction } from 'discord.js';
import Bot from '../classes/Bot.js';

type RunCommand = (client: Bot, interaction: CommandInteraction) => Promise<any>;

interface Command {
    name?: string;
    owner?: boolean;
    disabled?: boolean;
    run: RunCommand;
    cmdData: {};
}

export { RunCommand, Command };