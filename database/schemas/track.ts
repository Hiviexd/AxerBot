import { Schema } from "mongoose";

interface Targets {
    modes: string[];
    open: boolean;
    closed: boolean;
}

interface Tracker extends Document {
    _id: string;
    type: string;
    targets: Targets;
    targetsArray: string[];
    userId: string;
    channel: string;
    guild: string;
}

export default new Schema<Tracker>({
    _id: {
        type: String,
    },
    type: {
        type: String,
        default: "play",
        optional: true,
    },
    targets: {
        type: Object,
        default: {},
    },
    targetsArray: Array<String>,
    userId: String,
    channel: String,
    guild: String,
});
