import { Guild } from "discord.js";
import {
	consoleCheck,
	consoleError,
	consoleLog,
} from "../../helpers/core/logger";
import * as database from "..";

export default async function createNewGuild(guild_data: Guild) {
	try {
		consoleLog("createNewGuild", "Creating a new guild.");

		const g = new database.guilds({
			_id: guild_data.id,
		});

		await g.save();

		const r = await database.guilds.findOne({ _id: g.id });

		consoleCheck("createNewGuild", `guild ${g.id} created!`);

		return r;
	} catch (e: any) {
		if (e.code == 11000) {
			const u = await database.guilds.findOne({ _id: guild_data.id });

			return u;
		}

		consoleError("createNewGuild", "Something is wrong!");
		console.error(e);

		return null;
	}
}
