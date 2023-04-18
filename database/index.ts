import mongoose from "mongoose";
import { consoleCheck, consoleError, consoleLog } from "../helpers/core/logger";
import banchoUser from "./schemas/banchoUser";
import guild from "./schemas/guild";
import heardle from "./schemas/heardle";
import track from "./schemas/track";
import user from "./schemas/user";
import verification from "./schemas/verification";
import discussionEvent from "./schemas/discussionEvent";

consoleLog("database", "Starting database connection...");

mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    (e: any) => {
        if (e)
            return consoleError(
                "database",
                "An error has occurred:\n".concat(e.message)
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
export const banchoUsers = mongoose.model("BanchoUsers", banchoUser);
export const verifications = mongoose.model("Verifications", verification);
export const guilds = mongoose.model("Guilds", guild);
export const heardles = mongoose.model("Heardles", heardle);
export const tracks = mongoose.model("Tracks", track);
export const discussionEvents = mongoose.model(
    "DiscussionEvents",
    discussionEvent
);
