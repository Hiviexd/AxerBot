import { guilds } from "..";
import { consoleLog, consoleCheck } from "../../helpers/core/logger";

export default async () => {
	consoleLog("AddRevolverToGuildObject", "Checking all guilds");

	const allGuilds = await guilds.find();
	allGuilds.forEach(async (guild: any) => {
		if (!guild.embeds.scores) {
			guild.embeds.scores = {
				all: true,
				none: false,
				channels: [],
			};
			await guilds.findByIdAndUpdate(guild._id, guild);
		}
	});

	consoleCheck("AddRevolverToGuildObject", "All guilds updated!");
};
