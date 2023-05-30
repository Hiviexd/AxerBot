import { BanchoClient, PrivateMessage } from "bancho.js";

import { consoleLog } from "../../helpers/core/logger";
import { AxerBot } from "../../models/core/AxerBot";
import { LoggerClient } from "../../models/core/LoggerClient";
import { BanchoCommands } from "./commands";
import { calculateBeatmapFromAction } from "./helpers/calculateBeatmap";
import { Guild, GuildMember } from "discord.js";
import { User } from "../../types/user";

export interface IVerificationEvent {
    user: User;
    member: GuildMember;
    guild: Guild;
}

export class AxerBancho extends BanchoClient {
    private Logger = new LoggerClient("AxerBancho");
    public axer: AxerBot;
    private cooldownUsers: string[] = [];

    constructor(axer: AxerBot) {
        super({
            username: process.env.IRC_USERNAME || "eae",
            password: process.env.IRC_PASSWORD || "eae",
            port: Number(process.env.IRC_PORT) || 6667,
            apiKey: process.env.OSU_API_KEY,
            botAccount: true,
            gamemode: 1,
        });

        this.axer = axer;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.on("PM", (pm) => {
            if (this.isDuringCooldown(pm.user.ircUsername))
                return pm.user.sendMessage(
                    "Chill bro, you need to wait 3 seconds to use another command..."
                );

            this.handlePM.bind(this)(pm);
        });
        this.on("connected", () =>
            this.Logger.printSuccess("Connected to Bancho!")
        );
    }

    onVerification(f: (verification: IVerificationEvent) => void) {
        let cb = (this.on as any)("verification", f);
        cb = undefined;
    }

    private isDuringCooldown(username: string) {
        return this.cooldownUsers.includes(username);
    }

    private applyCooldownTo(username: string) {
        this.cooldownUsers.push(username);

        setTimeout(() => {
            this.cooldownUsers = this.cooldownUsers.filter(
                (u) => u != username
            );
        }, 3000);

        return this.cooldownUsers;
    }

    private handlePM(pm: PrivateMessage) {
        if (pm.user.ircUsername == process.env.IRC_USERNAME) return;

        if (pm.getAction()) return calculateBeatmapFromAction(pm);

        if (pm.content[0] != "!") return;

        this.applyCooldownTo(pm.user.ircUsername);

        const args = pm.content.split(" ");

        const commandName = args.splice(0, 1)[0].slice(1);

        const requestedCommand = BanchoCommands.find(
            (c) => c.settings.name == commandName
        );

        if (!requestedCommand) {
            consoleLog(
                "BanchoCommandHandler",
                `Command ${commandName} not found!`
            );

            return;
        }

        requestedCommand.run(pm, this, args);
    }
}

// export function connectToBancho() {
//     bancho
//         .connect()
//         .then((bancho) => {
//             consoleCheck(
//                 "BanchoClient",
//                 `Connected to bancho as ${process.env.IRC_USERNAME}!`
//             );
//         })
//         .catch((e) => {
//             consoleError("BanchoClient", `${e}`);
//         });
// }
