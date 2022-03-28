import { Guild } from "discord.js";
import { consoleCheck, consoleLog } from "../../helpers/core/logger";
import * as database from "..";

export default async function createNewGuild(guild_data: Guild) {
	consoleLog("createNewGuild", "Creating a new guild.");

	const g = new database.guilds({
		_id: guild_data.id,
	});

	await g.save();

	const r = await database.guilds.findOne({ _id: g.id });

	consoleCheck("createNewGuild", `guild ${g.id} created!`);

	return r;
}
