import { guilds } from ".."
import { consoleLog, consoleCheck } from "../../helpers/core/logger";

export default async () => {
    consoleLog("addButtonToGuildVerification", "Checking all guilds")
    
    const allGuilds = await guilds.find()
    allGuilds.forEach(async (guild:any) => {
        if (!guild.verification.button) {
            guild.verification.button = true;
            await guilds.findByIdAndUpdate(guild._id, guild)
        }
    })

    consoleCheck("addButtonToGuildVerification", "All guilds updated!")
}
