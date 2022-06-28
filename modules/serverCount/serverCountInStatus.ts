import { Client } from "discord.js";

export default async function serverCountInStatus(bot: Client, bot_user: any) {
    const guilds = await bot.guilds.fetch();
    bot_user.setPresence({
        activities: [{ name: `-help | ${guilds.size} servers` }],
    });
}
