import { EmbedBuilder } from "discord.js";
import colors from "./../../constants/colors";

export default new EmbedBuilder({
	title: "huh?",
	description:
		"Command not found! check `!help` for a list of available commands.",
	color: colors.orange,
});
