import { color } from "d3";
import { MessageEmbed } from "discord.js";
import colors from "./../../constants/colors";

export default new MessageEmbed({
	title: "huh?",
	description: `Please, provide a valid option! Use !help for more info.`,
	color: colors.orange,
});
