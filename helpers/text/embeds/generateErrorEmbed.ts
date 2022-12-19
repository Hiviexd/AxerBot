/*
    * ================ generateErrorEmbed.ts
    ? Generates an error embed
	? @param message - The message that triggered the command.
	? @param response - The response to be displayed (Optional).
	? @returns The success embed.
*/

import { MessageEmbed } from "discord.js";
import colors from "../../../constants/colors";

export default (response?: string): MessageEmbed => {
	return new MessageEmbed({
		title: "❌ Error",
		description: response || "There was an error executing this operation.",
		color: colors.red,
	});
};
