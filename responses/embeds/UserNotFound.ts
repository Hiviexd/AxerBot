import { EmbedBuilder } from "discord.js";
import colors from "./../../constants/colors";

export default new EmbedBuilder({
    title: "Wait... What?",
    description: "I don't know anyone who calls themselves that. Make sure you give me a valid name!\n\nIf you're trying to fetch your own data, make sure to run the command `/osuset` beforehand!",
}).setColor(colors.orange);
