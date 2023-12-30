import { PrivateMessage } from "bancho.js";

import { BanchoCommands } from ".";
import { AxerBancho } from "../client";

export default {
    settings: {
        name: "help",
        aliases: ["commands"],
        description: "This command",
    },
    run: async function (pm: PrivateMessage, bancho: AxerBancho, args: string[]) {
        const list = BanchoCommands.map(
            (command) => `!${command.settings.name} - ${command.settings.description}`
        );

        for (const command of list) {
            pm.user.sendMessage(command);
        }
    },
};
