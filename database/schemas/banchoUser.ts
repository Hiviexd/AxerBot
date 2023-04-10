import { Schema } from "mongoose";

export default new Schema({
    _id: {
        type: Number,
    },
    last_beatmap: String,
    last_beatmapset: String,
    last_command: Date,
});
