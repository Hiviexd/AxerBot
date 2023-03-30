import { guilds } from "..";
import { consoleLog, consoleCheck } from "../../helpers/core/logger";
import dotenv from "dotenv";
dotenv.config();
import "../";

export default async () => {
    consoleLog("addMapperRolesToDabase", "Checking all guilds");

    const allGuilds = await guilds.find();
    allGuilds.forEach(async (guild: any) => {
        if (!guild.verification.mapper_roles) {
            guild.verification.mapper_roles;
            await guilds.findByIdAndUpdate(guild._id, guild);
        }
    });

    consoleCheck("addMapperRolesToDabase", "All guilds updated!");
};
