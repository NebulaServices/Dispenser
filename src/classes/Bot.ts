import {Client, ClientOptions, Collection } from 'discord.js';
import { Command } from '../interfaces/Command';
import { Event } from '../interfaces/Event';
import { pathToFileURL } from 'url';
import { readdirSync } from 'fs';
import path from 'path';
import {createSpinner} from "nanospinner";


class Bot extends Client {
    constructor(options: ClientOptions) {
        super(options);
    }

    commands: Collection<string, Command> = new Collection();
    events: Collection<string, Event> = new Collection();
    cmdsArray: any[]=[];
    async start(): Promise<void> {
        // load cmds
        const commandFiles: string[] = readdirSync(path.join(process.env.rootdir, 'commands')).filter(file => file.replace(/\.ts$/, '.js').endsWith('.js'));
        commandFiles.map((commandFile: string): void => {
            const commandName = commandFile.replace(/(\.ts|\.js)$/, '');
            const spinCmd = createSpinner(`Loading command: ${commandName}`).start();
            let command: any | Command;
            try {
                command = import(String(pathToFileURL(path.join(process.env.rootdir, `commands/${commandFile}`))).replace(/\.ts$/, '.js'));
            } catch (error) {
                spinCmd.error({text: `Failed to load command ${commandName}`});
                return console.error(error)
            }
            this.commands.set(commandName, {name: commandName, ...command});
            this.cmdsArray.push(command.cmdData);
            spinCmd.success({text: `Loaded command: ${commandName}`});
        });

        // load events

        const eventFiles: string[] = readdirSync(path.join(process.env.rootdir, 'events')).filter(file => file.replace(/\.ts$/, '.js').endsWith('.js'));
        eventFiles.map(async (eventFile: string): Promise<void> => {
            const eventName = eventFile.replace(/(\.ts|\.js)$/, '');
            const spinEvent = createSpinner(`Loading command: ${eventName}`).start();
            let event: any | Event;
            try {
                event = await import(String(pathToFileURL(path.join(process.env.rootdir, `events/${eventFile}`))).replace(/\.ts$/, '.js'))
            } catch (error) {
                spinEvent.error({text: `Failed to load event ${eventName}`})
                return console.error(error);
            }
            this.events.set(eventName, {name: eventName, ...event});
            this.on(eventName, event.run.bind(null, this));
            spinEvent.success({text: `Loaded event: ${eventName}`})
        });
        this.login(process.env.TOKEN as never).catch((err: Error) => console.error(`>> DISCORD LOGIN FAILED: ${err.name}: ${err.message}`));
        Reflect.deleteProperty(process.env, 'TOKEN');
    }

}

export default Bot;