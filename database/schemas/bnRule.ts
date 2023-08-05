import { Schema } from "mongoose";
import colors from "../../constants/colors";

export default new Schema({
    _id: String,
    content: String,
    colour: { type: String, default: colors.pink },
    updatedAt: Date,
    createdAt: Date,
});
