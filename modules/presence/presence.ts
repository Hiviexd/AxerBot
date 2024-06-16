import { ActivityType, Client } from "discord.js";

export default async function presence(bot: Client, ready: boolean) {
    ready
        ? bot.user?.setPresence({
              status: "online",
              activities: [
                  {
                      name: `${bot.guilds.cache.size} servers | /help`,
                      type: ActivityType.Watching,
                  },
              ],
          })
        : bot.user?.setPresence({
              status: "dnd",
              activities: [{ name: `Booting up...`, type: ActivityType.Watching }],
          });
}
