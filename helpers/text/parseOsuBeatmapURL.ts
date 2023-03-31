export function parseOsuBeatmapURL(urlData: string) {
    try {
        new URL(urlData);
    } catch (e) {
        return {
            error: true,
            message: "Invalid URL!",
            data: null,
        };
    }
    const url = new URL(urlData);
    const paths = url.pathname
        .split("/")
        .map((p) => p.trim().toLowerCase())
        .filter((p) => p != "");

    const hash = url.hash
        .split("/")
        .map((p) => p.trim().toLowerCase().replace(/#/g, ""))
        .filter((p) => p != "");

    if (url.hostname != "osu.ppy.sh")
        return {
            error: true,
            message: "This isn't an osu! URL!",
            data: null,
        };

    // https://osu.ppy.sh/s/123
    if (paths[0] == "s" && paths.length == 2)
        return {
            error: false,
            message: "Found beatmapset old",
            data: {
                beatmapset_id: paths[1],
                beatmap_id: null,
                mode: null,
            },
        };

    // https://osu.ppy.sh/b/123
    if (paths[0] == "b" && paths.length == 2)
        return {
            error: false,
            message: "Found beatmap old",
            data: {
                beatmapset_id: paths[1],
                beatmap_id: null,
                mode: null,
            },
        };

    // https://osu.ppy.sh/beatmaps/123
    if (paths[0] == "beatmaps")
        return {
            error: false,
            message: "Found beatmap new",
            data: {
                beatmapset_id: null,
                beatmap_id: paths[1],
                mode: parseOsuBeatmapHash(hash).mode,
            },
        };

    // https://osu.ppy.sh/beatmapsets/123
    if (paths[0] == "beatmapsets")
        return {
            error: false,
            message: "Found beatmapset new",
            data: {
                beatmapset_id: paths[1],
                beatmap_id: parseOsuBeatmapHash(hash).beatmap_id,
                mode: parseOsuBeatmapHash(hash).mode,
            },
        };

    return {
        error: true,
        message: "Invalid beatmap URL format!",
        data: {
            beatmapset_id: null,
            beatmap_id: null,
            mode: null,
        },
    };
}

function parseOsuBeatmapHash(hash: string[]) {
    const modes = ["osu", "taiko", "fruits", "mania"];

    // #taiko
    if (modes.includes(hash[0]) && hash.length == 1)
        return {
            error: false,
            message: "found simple hash",
            mode: hash[0],
            beatmap_id: null,
        };

    // #taiko/123
    if (modes.includes(hash[0]) && hash.length == 2)
        return {
            error: false,
            mode: hash[0],
            message: "found complete",
            beatmap_id: hash[1],
        };

    // #taiko/123
    if (!isNaN(Number(hash[0])))
        return {
            error: false,
            mode: null,
            message: "found complete with mode",
            beatmap_id: Number(hash[0]).toString(),
        };

    return {
        error: true,
        message: "invalid hash",
        mode: null,
        beatmap_id: null,
    };
}
