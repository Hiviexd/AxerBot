import { Client } from "discord.js";
import { readdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import {
    consoleLog,
    consoleCheck,
    consoleError,
} from "./../../helpers/core/logger";
import path from "path";

function getAvatarsList() {
    return readdirSync(path.resolve("./avatars")).filter((i) =>
        i.endsWith(".jpg")
    );
}

function relativeDate(date1: Date, date2: Date) {
    return Math.floor(
        (date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24)
    );
}

function getNextAvatar(currentIndex: number) {
    if (currentIndex + 1 == getAvatarsList().length)
        return {
            path: path.resolve(`./avatars/${getAvatarsList()[0]}`),
            name: getAvatarsList()[currentIndex + 1],
        };

    return {
        path: path.resolve(`./avatars/${getAvatarsList()[currentIndex + 1]}`),
        name: getAvatarsList()[currentIndex + 1],
    };
}

function getCurrentAvatarStatus(client: Client) {
    if (!existsSync(path.resolve("./cache/avatarConfig.json")))
        createConfig(client);

    return JSON.parse(
        readFileSync(path.resolve("./cache/avatarConfig.json"), "utf8")
    );
}

function changeAvatar(currentIndex: number, client: Client) {
    consoleCheck(
        "avatarManager",
        "A new avatar change is available! Changing avatar..."
    );

    const newAvatar = getNextAvatar(currentIndex);

    client.user
        ?.setAvatar(newAvatar.path)
        .then(() => {
            writeFileSync(
                path.resolve("./cache/avatarConfig.json"),
                JSON.stringify({
                    filename: newAvatar.name || "1.jpg",
                    replaced: new Date(),
                }),
                "utf8"
            );

            consoleCheck(
                "avatarManager",
                `Avatar changed to ${newAvatar.name}!`
            );
        })
        .catch((e: any) => {
            consoleError(
                "avatarManager",
                `Couldn't change avatar: ${e.message}`
            );
        });
}

function createConfig(client: Client) {
    fallbackAvatar(client);
    consoleCheck("avatarManager", "Created avatar config file!");
}

function fallbackAvatar(client: Client) {
    consoleLog("AvatarManager", "Fallbacking avatar...");

    writeFileSync(
        path.resolve("./cache/avatarConfig.json"),
        JSON.stringify({ filename: "1.jpg", replaced: new Date() }),
        "utf8"
    );

    return client.user
        ?.setAvatar(path.resolve("./avatars/1.jpg"))
        .catch((e: any) => {
            consoleError(
                "avatarManager",
                `Couldn't change avatar: ${e.message}`
            );
        });
}

function checkForAvatarChange(client: Client) {
    const currentAvatar = getCurrentAvatarStatus(client);

    const avatarIndex = getAvatarsList().findIndex(
        (a) => a == currentAvatar.filename
    );

    if (!currentAvatar.filename || avatarIndex == -1)
        return fallbackAvatar(client);

    if (relativeDate(new Date(currentAvatar.replaced), new Date()) >= 1) {
        changeAvatar(avatarIndex, client);
    } else {
        void {};
    }
}

export function startAvatarListener(client: Client) {
    setInterval(() => {
        checkForAvatarChange(client);
    }, 5000); //checks for avatar change every 5 seconds
}
