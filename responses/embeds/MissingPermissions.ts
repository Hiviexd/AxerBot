import { EmbedBuilder } from "discord.js";
import colors from "./../../constants/colors";

export default new EmbedBuilder({
    title: "🛑 Missing permissions!",
    description: "You don't have enough permissions to use this command!",
}).setColor(colors.red);
