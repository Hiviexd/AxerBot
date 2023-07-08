import events from "../../events";
import { consoleCheck, consoleError, consoleLog } from "./logger";
import { AxerBot } from "../../models/core/AxerBot";

export default function eventHandler(axer: AxerBot) {
    consoleLog("eventHandler", "Starting event listener...");

    events.forEach((ev) => {
        try {
            ev.execute(axer);
            consoleCheck("eventHandler", `Event ${ev.name} started!`);
        } catch (e) {
            consoleError("eventHandler", `Error during event ${ev.name}:\n`);
            console.error(e);
        }
    });

    consoleCheck("eventListener", "Events loaded!");
}
