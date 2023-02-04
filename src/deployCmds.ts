import { createSpinner } from "nanospinner";
import perfy from "perfy";
import { REST, Routes } from "discord.js";
import inquirer from 'inquirer';
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN as never);

async function deployCmds(): Promise<void> {
     let answer = await inquirer.prompt({
         name: 'data',
         type: 'input',
         message: 'Please paste your commands JSON\n'
     })
    const deploySpin = createSpinner('Ok hold on').start();
    perfy.start('deployCmds')
    await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID as string, process.env.SLASHCMD_GUILD_ID as string), {body: eval(answer.data)}).catch(e => {
        deploySpin.error({text: `\nError deploying server commands!`});
        console.error(e);
        return deployCmds();
    })
    deploySpin.success({text: `Deployed server commands in ${perfy.end('deployCmds').time}s`});
}

deployCmds();