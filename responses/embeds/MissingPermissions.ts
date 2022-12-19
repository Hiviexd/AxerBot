import { MessageEmbed } from "discord.js";
import colors from "./../../constants/colors";

export default new MessageEmbed({
	title: "Missing permissions!",
	description: "You don't have enough permissions to use this command!",
	color: colors.red,
});
