import { Schema } from "mongoose";

export default new Schema({
    _id: {
        type: String,
        required: true,
    },
    target_user: {
        type: String,
        required: true,
    },
    target_guild: {
        type: String,
        required: true,
    },
    target_channel: {
        type: String,
        required: false,
    },
    code: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
    },
    type: {
        type: String,
        default: "verification",
    },
});
