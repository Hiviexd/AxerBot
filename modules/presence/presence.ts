import { Client } from "discord.js";

export default async function presence(bot: Client, bot_user: any, ready: boolean) {
    const guilds = await bot.guilds.fetch();
    ready ?
        bot_user.setPresence({
            status: "online",
            activities: [{ name: `${guilds.size} servers | -help`, type: "WATCHING" }],
        })
    :
        bot_user.setPresence({
            status: "dnd",
            activities: [{ name: `Booting up...`, type: "PLAYING" }],
        });
}
