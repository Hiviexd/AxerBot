import { Schema } from "mongoose";

export default new Schema({
    _id: {
        type: Number,
        required: true,
    },
    beatmapsetId: { type: Number, required: true },
    beatmapId: { type: Number, required: false },
    userId: { type: Number, required: false },
    discussionId: { type: Number, required: false },
    discussionPostId: { type: Number, required: false },
    content: { type: String, required: false },
    type: {
        type: String,
        required: true,
        enum: [
            "nominate",
            "qualify",
            "disqualify",
            "nomination_reset",
            "nomination_reset_received",
            "rank",
            "issue_reopen",
            "issue_resolve",
            "genre_edit",
            "language_edit",
            "nsfw_toggle",
            "offset_edit",
            "tags_edit",
            "beatmap_owner_change",
        ],
    },
    createdAt: Date,
});
