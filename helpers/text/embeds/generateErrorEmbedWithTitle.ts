/*
    * ================ generateErrorEmbed.ts
    ? Generates an error embed
	? @param message - The message that triggered the command.
	? @param response - The response to be displayed (Optional).
	? @returns The success embed.
*/

import { EmbedBuilder } from "discord.js";
import colors from "../../../constants/colors";

export default (title: string, response?: string): EmbedBuilder => {
	return new EmbedBuilder({
		title: title,
		description: response || "There was an error executing this operation.",
	}).setColor(colors.red);
};
