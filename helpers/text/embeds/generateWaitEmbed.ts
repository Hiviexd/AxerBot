import { EmbedBuilder } from "discord.js";
import colors from "../../../constants/colors";

export default (title?: string, response?: string): EmbedBuilder => {
    return new EmbedBuilder({
        title: title || "Please wait...",
        description: response || "This can take a while...",
    }).setColor(colors.yellowBright);
};
