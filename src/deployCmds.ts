import { createSpinner } from "nanospinner";
import perfy from "perfy";
import {REST, Routes} from "discord.js";
import inquirer from 'inquirer';

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN as never);

async function deployCmds(): Promise<void> {
    let answer = await inquirer.prompt({
        name: 'cmdsData',
        type: 'input',
        message: 'Please paste your commands JSON\n'
    })
    const deploySpin = createSpinner('Deploying server commands').start();
    perfy.start('deployCmds')
    await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID as string, process.env.SLASHCMD_GUILD_ID as string), {body: JSON.stringify(answer.cmdsData)},
    ).catch(e => {
        deploySpin.error({text: `Error deploying server cmds!`});
        console.error(e)
        return deployCmds();
    })
    deploySpin.success({text: `Deployed server commands in ${perfy.end('deployCmds').time}s`});
}

deployCmds();