import { EmbedBuilder } from "discord.js";
import colors from "./../../constants/colors";

export default new EmbedBuilder({
    title: "Gimme a bit",
    description: "Processing command...",
}).setColor(colors.pink);
