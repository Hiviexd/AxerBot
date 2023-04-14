import { BanchoClient, PrivateMessage } from "bancho.js";

import { BanchoCommands } from ".";

export default {
    settings: {
        name: "help",
        description: "This command",
    },
    run: async function (
        pm: PrivateMessage,
        bancho: BanchoClient,
        args: string[]
    ) {
        const list = BanchoCommands.map(
            (command) =>
                `!${command.settings.name} - ${command.settings.description}`
        );

        for (const command of list) {
            pm.user.sendMessage(command);
        }
    },
};
