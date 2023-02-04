import {CommandInteraction} from 'discord.js'
import { RunCommand } from '../interfaces/Command';
import Bot from '../classes/Bot';

const run: RunCommand = async (client: Bot, interaction: CommandInteraction): Promise<any> => {

};


const name: string = 'test';
const cmdData = {
    name: name,
    description: 'test the bot',
    options: []
}

export { run, name, cmdData };