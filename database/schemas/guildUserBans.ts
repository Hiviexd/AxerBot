import { Schema } from "mongoose";

export interface GuildUserBans {
    _id: string;
    userId: string;
    guildId: string;
    reason: string;
    authorId: string;
    createdAt: Date;
}

export default new Schema({
    _id: {
        type: String,
        required: true,
    },
    userId: String,
    guildId: String,
    reason: String,
    authorId: String,
    createdAt: Date,
});
