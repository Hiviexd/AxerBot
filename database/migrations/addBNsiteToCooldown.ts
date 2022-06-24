import { guilds } from ".."
import { consoleLog, consoleCheck } from "../../helpers/core/logger";

export default async () => {
    consoleLog("addBNsiteToCooldowns", "Checking all guilds")

    const allGuilds = await guilds.find()
    allGuilds.forEach(async (guild:any) => {
        if (!guild.cooldown.BNsite) {
            guild.cooldown.BNsite = {
                size: 0,
				ends_at: {},
				current_increments: 0,
				increments: 0,
				channels: [],
            }
            await guilds.findByIdAndUpdate(guild._id, guild)
        }
    });

    consoleCheck("addBNsiteToCooldowns", "All guilds updated!")
}