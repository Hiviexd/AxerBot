/*
    * ================ generateSuccessEmbed.ts
    ? Generates a success embed
	? @param message - The message that triggered the command.
	? @param response - The response to be displayed (Optional).
	? @returns The success embed.
*/

import { EmbedBuilder } from "discord.js";
import colors from "../../../constants/colors";

export default (response?: string): EmbedBuilder => {
	return new EmbedBuilder({
		title: "✅ Success!",
		description: response || "Operation successful.",
		color: colors.green,
	});
};
