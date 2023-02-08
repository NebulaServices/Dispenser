import { CommandInteraction } from 'discord.js'
import { RunCommand } from '../interfaces/Command';
import Bot from '../classes/Bot';

const run: RunCommand = async (client: Bot, interaction: CommandInteraction): Promise<any> => {

};

const name: string = 'add';
const cmdData = {
    name: name,
    description: 'Add domains to dispense.',
    options: [

    ]
}

export { run, name, cmdData };