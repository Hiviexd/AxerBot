import { color } from "d3";
import { EmbedBuilder } from "discord.js";
import colors from "./../../constants/colors";

export default new EmbedBuilder({
	title: "huh?",
	description: `Please, provide a valid option! Use !help for more info.`,
	color: colors.orange,
});
