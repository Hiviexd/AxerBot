import {MessageEmbed } from "discord.js";

export default(response: string[]): MessageEmbed => {
	return new MessageEmbed({
		title: "❌ Missing permissions",
	    description: `You don't have enough permissions to use this command!`,
        fields: [{
            name: "Missing Permissions",
            value: `\`${response.join("\n")}\``
        }],
	    color: "#ff5050",
	});
};
