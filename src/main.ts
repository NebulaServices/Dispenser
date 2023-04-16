import { Bot } from './classes/Bot';


new Bot(process.env.TOKEN as never, {intents: ["GuildMessages", "Guilds", "GuildMessageReactions", "MessageContent"]}, "status");
Reflect.deleteProperty(process.env, 'TOKEN');