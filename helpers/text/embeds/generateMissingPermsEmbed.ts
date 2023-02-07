import { EmbedBuilder } from "discord.js";
import colors from "../../../constants/colors";

export default (response: string[]): EmbedBuilder => {
	return new EmbedBuilder({
		title: "❌ Missing permissions",
		description: `You don't have enough permissions to use this command!`,
		fields: [
			{
				name: "Missing Permissions",
				value: `\`${response.join("\n")}\``,
			},
		],
		color: colors.red,
	});
};
