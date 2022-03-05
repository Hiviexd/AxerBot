import mongoose from "mongoose";
import { consoleCheck, consoleError, consoleLog } from "../utils/core/logger";
import { Users } from "./schemas/user";

consoleLog("database", "Starting databse connection...");

mongoose.connect(
	`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
	(err) => {
		if (err)
			return consoleError(
				"database",
				"An error has occurred:\n".concat(err.message)
			);

		consoleCheck("database", "Database connected!");
	}
);

export const users = mongoose.model("Users", Users);
export const guilds = mongoose.model("Guilds", Users);
