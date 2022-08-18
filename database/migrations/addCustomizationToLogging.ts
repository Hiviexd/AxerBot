import { guilds } from ".."
import { consoleLog, consoleCheck } from "../../helpers/core/logger";

export default async () => {
    consoleLog("addCustomizationToLogging", "Checking all guilds")
    
    const allGuilds = await guilds.find()
    allGuilds.forEach(async (guild:any) => {
        if (!guild.logging.guildMemberAdd) {
            guild.logging.guildMemberAdd = true;
            guild.logging.guildMemberRemove = true;
            guild.logging.messageDelete = true;
            guild.logging.messageUpdate = true;
            await guilds.findByIdAndUpdate(guild._id, guild)
        }
    })

    consoleCheck("addCustomizationToLogging", "All guilds updated!")
}
