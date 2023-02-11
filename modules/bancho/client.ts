import { BanchoClient } from "bancho.js";
import {
    consoleCheck,
    consoleError,
    consoleLog,
} from "../../helpers/core/logger";
import { BanchoCommands } from "./commands";

export const bancho = new BanchoClient({
    username: process.env.IRC_USERNAME || "",
    password: process.env.IRC_PASSWORD || "",
    port: Number(process.env.IRC_PORT) || 6667,
    apiKey: process.env.OSU_API_KEY,
    limiterTimespan: 10000,
    limiterPrivate: 10000,
});

bancho.on("PM", (pm) => {
    if (pm.user.ircUsername == process.env.IRC_USERNAME) return;
    const args = pm.message.split(" ");

    const commandName = args.splice(0, 1)[0].slice(1);

    const requestedCommand = BanchoCommands.find(
        (c) => c.settings.name == commandName
    );

    if (!requestedCommand) {
        consoleLog("BanchoCommandHandler", `Command ${commandName} not found!`);

        return;
    }

    requestedCommand.run(pm, bancho, args);
});

export function connectToBancho() {
    bancho
        .connect()
        .then((bancho) => {
            consoleCheck("BanchoClient", "Connected to bancho!");
        })
        .catch((e) => {
            consoleError("BanchoClient", `${e}`);
        });
}
