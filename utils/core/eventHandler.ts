import { Client } from "discord.js";
import events from "./../../events";
import { consoleCheck, consoleError, consoleLog } from "./logger";

export default function eventHandler(bot: Client) {
	consoleLog("eventHandler", "Starting event listener...");

	events.forEach((ev) => {
		try {
			ev.execute(bot);
			consoleCheck("eventHandler", `Event ${ev.name} started!`);
		} catch (e) {
			consoleError("eventHandler", `Error during event ${ev.name}:\n`);
			console.error(e);
		}
	});

	consoleCheck("eventListener", "Events loaded!");
}
