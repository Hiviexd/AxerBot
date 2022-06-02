/*
    * ================ generateSuccessEmbed.ts
    ? Generates a success embed
	? @param message - The message that triggered the command.
	? @param response - The response to be displayed (Optional).
	? @returns The success embed.
*/

import {MessageEmbed } from "discord.js";

export default(response?: string): MessageEmbed => {
	return new MessageEmbed({
		title: "Success!",
		description: response || "✅ Operation successful.",
		color: "#1df27d",
	});
};

				