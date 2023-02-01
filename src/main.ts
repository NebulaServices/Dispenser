import Bot from './classes/Bot';
import DB from './classes/DB';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { GatewayIntentBits } from 'discord.js';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            readonly rootdir: string;
            readonly TOKEN: unique symbol;
            readonly AUTHORIZED_EVAL_USERS?: string;
            readonly CLIENT_ID?: string;
            readonly SLASHCMD_GUILD_ID?: string;
            readonly DATABASE_URL?: string;
        }
    }
}

Reflect.set(process.env, 'rootdir', dirname(fileURLToPath(import.meta.url)));

const client: Bot = new Bot({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

await DB.connect();
await client.start();