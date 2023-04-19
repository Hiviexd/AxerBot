import { Schema } from "mongoose";

export default new Schema({
    _id: {
        type: Number,
        required: true,
    },
    beatmapsetId: { type: Number, required: false },
    beatmapId: { type: Number, required: false },
    userId: { type: Number, required: false },
    type: {
        type: String,
        required: true,
        enum: [
            "beatmapsetApprove",
            "beatmapsetDelete",
            "beatmapsetRevive",
            "beatmapsetUpdate",
            "beatmapsetUpload",
            "beatmapsetGraveyard",
        ],
    },
    createdAt: Date,
});
