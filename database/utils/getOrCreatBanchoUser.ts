import {
    consoleCheck,
    consoleError,
    consoleLog,
} from "../../helpers/core/logger";
import * as database from "..";

export interface IDatabaseBanchoUser {
    _id: number;
    last_beatmap: string | null;
    last_beatmapset: string | null;
    last_command: Date;
}

export default async function getOrCreateBanchoUser(
    userId: number
): Promise<IDatabaseBanchoUser | null> {
    try {
        consoleLog("getOrCreateBanchoUser", "Creating a new user.");

        const u = new database.banchoUsers({
            _id: userId,
        });

        const userResponse = await u.save();

        consoleCheck("getOrCreateBanchoUser", `User ${userId} created!`);

        return userResponse as IDatabaseBanchoUser;
    } catch (e: any) {
        if (e.code == 11000) {
            consoleLog(
                "getOrCreateBanchoUser",
                `User ${userId} already exists! Skipping...`
            );

            const u = await database.banchoUsers.findById(userId);

            return u as IDatabaseBanchoUser | null;
        }

        consoleError("getOrCreateBanchoUser", "Something is wrong!");
        console.error(e);

        return null;
    }
}
