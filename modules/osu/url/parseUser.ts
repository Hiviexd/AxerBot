import { Message } from "discord.js";

import MapperEmbed from "../../../responses/osu/MapperEmbed";
import PlayerEmbed from "../../../responses/osu/PlayerEmbed";
import osuApi from "../fetcher/osuApi";
import * as database from "./../../../database";

export default async (url: string, message?: Message) => {
    const user_params = getUserParams(url);
    const user = await osuApi.fetch.user(user_params.id, user_params.mode);

    let user_config: any = await database.users.find();

    if (user.status != 200) return;

    user_config = user_config
        .filter((u: any) => u.osu.username != undefined)
        .filter(
            (u: any) =>
                u.osu.username.toString().toLowerCase() ==
                user.data.username.toString().toLowerCase()
        )[0];

    function getUserParams(url: string) {
        const playmodes = ["osu", "taiko", "fruits", "mania"];
        let url_object = url.split("/");

        let data: {
            id: string;
            mode: string | undefined;
        } = {
            id: "",
            mode: undefined,
        };

        // ? Remove playmode from url (users/{id}/{mode})
        if (playmodes.includes(url_object[url_object.length - 1])) {
            data.id = url_object[url_object.length - 2]; // ? Mode
            data.mode = url_object[url_object.length - 1]; // ? ID
        } else {
            data.id = url_object[url_object.length - 1]; // ? ID
        }

        return data;
    }

    if (user_config != undefined) {
        if (user_config.osu.embed == "player") {
            if (message) {
                return PlayerEmbed.send(user, message, user_params.mode);
            }
        }

        if (user_config.osu.embed == "mapper") {
            const maps = await osuApi.fetch.userBeatmaps(
                user.data.id.toString()
            );

            if (message) {
                return MapperEmbed.send(user, maps, message);
            }
        }

        if (message) {
            return PlayerEmbed.send(user, message, user_params.mode);
        }
    }

    if (message) {
        return PlayerEmbed.send(user, message, user_params.mode);
    }
};
