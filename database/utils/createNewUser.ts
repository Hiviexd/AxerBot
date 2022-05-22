import {
	consoleCheck,
	consoleError,
	consoleLog,
} from "../../helpers/core/logger";
import * as database from "./../";

export default async function createNewUser(user_data: any) {
	try {
		consoleLog("createNewUser", "Creating a new user.");

		const u = new database.users({
			_id: user_data.id,
		});

		await u.save();

		const r = await database.users.findOne({ _id: u.id });

		consoleCheck("createNewUser", `User ${u.id} created!`);

		return r;
	} catch (e: any) {
		if (e.code == 11000) {
			const u = await database.users.findOne({ _id: user_data.id });

			return u;
		}

		consoleError("createNewUser", "Something is wrong!");
		console.error(e);

		return null;
	}
}
