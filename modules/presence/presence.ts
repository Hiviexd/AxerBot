import { ActivityType, ActivitiesOptions, Client } from "discord.js";

export default async function presence(
    bot: Client,
    bot_user: any,
    ready: boolean
) {
    ready
        ? bot.user?.setActivity({
              name: `${bot.guilds.cache.size} servers | /help`,
              type: ActivityType.Watching,
              // status: "online",
              // activities: [
              // 	{
              // 		name: `${bot.guilds.cache.size} servers | /help`,
              // 		type: ActivityType.Watching
              // 	},
              // ],
          })
        : bot.user?.setPresence({
              status: "dnd",
              activities: [
                  { name: `Booting up...`, type: ActivityType.Listening },
              ],
          });
}
