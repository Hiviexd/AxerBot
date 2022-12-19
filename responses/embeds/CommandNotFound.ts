import { MessageEmbed } from "discord.js";
import colors from "./../../constants/colors";

export default new MessageEmbed({
	title: "huh?",
	description:
		"Command not found! check `!help` for a list of available commands.",
	color: colors.orange,
});
