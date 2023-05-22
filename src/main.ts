/*

     ____
    /\  _`\   __                                                               __
    \ \ \/\ \/\_\    ____  _____      __    ___     ____     __   _ __       /'__`\
     \ \ \ \ \/\ \  /',__\/\ '__`\  /'__`\/' _ `\  /',__\  /'__`\/\`'__\    /\_\L\ \
      \ \ \_\ \ \ \/\__, `\ \ \L\ \/\  __//\ \/\ \/\__, `\/\  __/\ \ \/     \/_/_\_<_
       \ \____/\ \_\/\____/\ \ ,__/\ \____\ \_\ \_\/\____/\ \____\\ \_\       /\ \L\ \
        \/___/  \/_/\/___/  \ \ \/  \/____/\/_/\/_/\/___/  \/____/ \/_/       \ \____/
                             \ \_\                                             \/___/
                              \/_/

 */

import { Bot } from './classes/Bot';
import { ActivityType } from 'discord.js';

const bot = new Bot(process.env.TOKEN as never, { intents: ["GuildMessages", "Guilds", "GuildMessageReactions", "MessageContent"] });
bot.showStatus("dnd", {name: "in a competition !", type: ActivityType.Competing})

Reflect.deleteProperty(process.env, 'TOKEN');