import { consoleCheck, consoleLog } from "../../helpers/core/logger";
import * as database from "./../";

export default async function createNewUser(user_data: any) {
	consoleLog("createNewUser", "Creating a new user.");

	const u = new database.users({
		_id: user_data.id,
	});

	await u.save();

	const r = await database.users.findOne({ _id: u.id });

	consoleCheck("createNewUser", `User ${u.id} created!`);

	return r;
}
