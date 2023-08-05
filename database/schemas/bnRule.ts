import { Schema } from "mongoose";

export default new Schema({
    _id: String,
    content: String,
    updatedAt: Date,
    createdAt: Date,
});
