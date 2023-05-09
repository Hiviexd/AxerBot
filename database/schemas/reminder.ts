import { Schema } from "mongoose";

export default new Schema({
    _id: { type: String, required: true },
    isPrivate: { type: Boolean, default: false },
    content: { type: String, required: true },
    channelId: { type: String },
    guildId: { type: String },
    parentMessageId: { type: String },
    userId: { type: String, required: true },
    createdAt: { type: Date, required: true },
    sendAt: { type: Date, required: true },
});
