import mongoose from "mongoose";
import { consoleCheck, consoleError, consoleLog } from "../helpers/core/logger";
import banchoUser from "./schemas/banchoUser";
import guild from "./schemas/guild";
import heardle from "./schemas/heardle";
import track from "./schemas/track";
import user from "./schemas/user";
import verification from "./schemas/verification";
import discussionEvent from "./schemas/discussionEvent";
import userEvent from "./schemas/userEvent";
import selectRole from "./schemas/selectRole";
import reminder from "./schemas/reminder";
import guildUserBans from "./schemas/guildUserBans";
import bnRule from "./schemas/bnRule";
import kudosuUser from "./schemas/kudosuUser";

consoleLog("database", "Starting database connection...");

mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    (e: any) => {
        if (e) return consoleError("database", "An error has occurred:\n".concat(e.message));

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
export const selectRoles = mongoose.model("SelectRoles", selectRole);
export const discussionEvents = mongoose.model("DiscussionEvents", discussionEvent);
export const reminders = mongoose.model("UserReminders", reminder);
export const bnRules = mongoose.model("BNRules", bnRule);
export const userEvents = mongoose.model("UserEvents", userEvent);
export const guildUserAccountBans = mongoose.model("GuildUserBans", guildUserBans);
export const kudosuUsers = mongoose.model("KudosuUsers", kudosuUser);
