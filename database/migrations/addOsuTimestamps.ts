import { guilds } from ".."
import { consoleLog, consoleCheck } from "../../helpers/core/logger";

export default async () => {
    consoleLog("addOsuTimestamps", "Checking all guilds")
    
    const allGuilds = await guilds.find()
    allGuilds.forEach(async (guild:any) => {
        if (!guild.osuTimestamps) {
            guild.osuTimestamps = true;
            await guilds.findByIdAndUpdate(guild._id, guild)
        }
    })

    consoleCheck("addOsuTimestamps", "All guilds updated!")
}
