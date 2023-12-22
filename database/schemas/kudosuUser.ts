import { Schema } from "mongoose";

export interface KudosuUser {
    _id: string;
    avatar_url: string;
    osuId: number;
    username: string;
    rank: number;
    kudosu: number;
    updatedAt: Date;
}

export default new Schema({
    _id: String,
    avatar_url: String,
    osuId: {
        type: Number,
        unique: true,
    },
    username: String,
    rank: Number,
    kudosu: Number,
    updatedAt: Date,
});
