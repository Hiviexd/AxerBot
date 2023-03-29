import { Schema } from "mongoose";

export default new Schema({
    _id: {
        type: String,
    },
    pending_verifications: {
        type: Array,
        default: [],
    },
    osu: {
        type: Object,
        default: {
            username: undefined,
            mode: undefined,
        },
    },
    verified_id: {
        type: Number,
        default: 0,
    },
    reminders: {
        type: Array,
        default: [],
    },
    web_token: String,
});
