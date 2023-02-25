import mongoose from "mongoose";
import { consoleCheck, consoleError, consoleLog } from "../helpers/core/logger";
import addRevolverToGuildObject from "./migrations/addRevolverToGuildObject";
import addBNsiteToCooldown from "./migrations/addBNsiteToCooldown";
import addButtonToGuildVerification from "./migrations/addButtonToGuildVerification";
import guild from "./schemas/guild";
import user from "./schemas/user";
import heardle from "./schemas/heardle";
import track from "./schemas/track";
import addScoreEmbedConfiguration from "./migrations/addScoreEmbedConfiguration";
import verification from "./schemas/verification";
import addFlagsLeaderboard from "./migrations/addFlagsLeaderboard";

consoleLog("database", "Starting database connection...");

mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    (err) => {
        if (err)
            return consoleError(
                "database",
                "An error has occurred:\n".concat(err.message)
            );

        consoleCheck("database", "Database connected!");

        //! Migrations
        // addBNsiteToCooldown();
        //addButtonToGuildVerification()
        //addScoreEmbedConfiguration();
        //addFlagsLeaderboard();
    }
);

export const users = mongoose.model("Users", user);
export const verifications = mongoose.model("Verifications", verification);
export const guilds = mongoose.model("Guilds", guild);
export const heardles = mongoose.model("Heardles", heardle);
export const tracks = mongoose.model("Tracks", track);
