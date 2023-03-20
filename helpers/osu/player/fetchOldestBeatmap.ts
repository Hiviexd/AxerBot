import { Beatmapset } from "../../../types/beatmap";
import { User } from "../../../types/user";
import osuApi from "../fetcher/osuApi";

export async function fetchOldestBeatmap(user: User) {
    const status = ["graveyard", "pending", "ranked", "loved"];
    const statusStringObject: { [key: string]: string } = {
        graveyard: "graveyard_beatmapset_count",
        pending: "pending_beatmapset_count",
        loved: "loved_beatmapset_count",
        ranked: "ranked_and_approved_beatmapset_count",
    };

    const maps: Beatmapset[] = [];

    for (const s of status) {
        const b = await osuApi.fetch.basicUserBeatmaps(
            user.id,
            s,
            1,
            ((user as any)[statusStringObject[s]] as number) - 1
        );

        if (b.data && b.status == 200) maps.push(b.data[0]);
    }

    maps.sort(
        (a, b) =>
            new Date(a.submitted_date).valueOf() -
            new Date(b.submitted_date).valueOf()
    );

    return maps[0];
}
