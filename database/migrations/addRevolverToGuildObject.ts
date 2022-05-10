import { guilds } from ".."
import { consoleLog, consoleCheck } from "../../helpers/core/logger";

export default async () => {
    consoleLog("AddRevolverToGuildObject", "Checking all guilds")
    
    const allGuilds = await guilds.find()
    allGuilds.forEach(async (guild:any) => {
        if (!guild.fun.revolver) {
            guild.fun.revolver = 0;
            await guilds.findByIdAndUpdate(guild._id, guild)
        }
    })

    consoleCheck("AddRevolverToGuildObject", "All guilds updated!")
}