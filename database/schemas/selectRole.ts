import { Schema } from "mongoose";
import colors from "../../constants/colors";

export default new Schema({
    _id: {
        type: String,
    },
    channel: { type: String, required: true },
    guild_id: { type: String, required: true },
    roles: [String],
    embed: {
        type: Object,
        default: {
            title: "Select Roles",
            description: "Click on the button below to select roles",
            color: colors.pink as string,
            image: "",
            thumbnail: "",
        },
    },
});
