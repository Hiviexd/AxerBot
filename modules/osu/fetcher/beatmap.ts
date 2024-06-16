import axios from "axios";
import { consoleCheck, consoleError, consoleLog } from "../../../helpers/core/logger";
import {
    BeatmapResponse,
    Beatmapset,
    BeatmapsetDiscussion,
    BeatmapsetDiscussionPostResponse,
    BeatmapsetDiscussionVoteResponse,
    BeatmapsetEvent,
    BeatmapsetEventType,
    BeatmapsetResponse,
    BeatmapsetSearchResponse,
    UserBeatmapetsResponse,
} from "../../../types/beatmap";
import { IHTTPResponse } from "../../../types/http";
import { HTTPResponse } from "../../../types/qat";
import { FetchDownloadClient, OsuAuthenticator, OsuOfficialDownloader } from "./downloader/beatmap";
import { UserCompact } from "../../../types/user";
import { BeatmapGenre, BeatmapLanguage } from "../../../struct/beatmaps/SearchTypes";

export async function beatmap(beatmap_id: string): Promise<BeatmapResponse> {
    try {
        consoleLog("beatmap fetcher", `Fetching beatmap ${beatmap_id}`);

        const req = await axios("https://osu.ppy.sh/api/v2/beatmaps/".concat(beatmap_id), {
            headers: {
                authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
            },
        });

        const res = req.data;

        consoleCheck("beatmap fetcher", `Beatmap ${beatmap_id} found!`);

        return {
            status: 200,
            data: res,
        };
    } catch (e: any) {
        consoleError("beatmap fetcher", "Wtf an error:");
        console.error(e);

        return {
            status: 500,
            data: e,
        };
    }
}

export async function allBeatmapsetEvents(types?: BeatmapsetEventType[]): Promise<
    IHTTPResponse<{
        events: BeatmapsetEvent[];
        reviewsConfig: {
            max_blocks: number;
        };
        users: UserCompact[];
    }>
> {
    try {
        consoleLog("beatmap fetcher", `Fetching all beatmapset events`);

        const url = new URL("https://osu.ppy.sh/api/v2/beatmapsets/events");

        if (types) {
            for (const type of types) {
                url.searchParams.append("types[]", type.toString());
            }
        }

        const req = await axios(url.href, {
            headers: {
                authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
            },
        });

        const res = req.data;

        consoleCheck("beatmap fetcher", `All beatmapset events found!`);

        return {
            status: 200,
            data: res,
        };
    } catch (e: any) {
        consoleError("beatmap fetcher", "Wtf an error:");
        console.error(e);

        return {
            status: 500,
            data: e,
        };
    }
}

export async function beatmapset(
    beatmapset_id: string,
    mode?: "osu" | "taiko" | "mania" | "fruits"
): Promise<BeatmapsetResponse> {
    try {
        consoleLog("beatmap fetcher", `Fetching beatmapset ${beatmapset_id}`);

        const req = await axios(
            "https://osu.ppy.sh/api/v2/beatmapsets/"
                .concat(beatmapset_id)
                .concat(mode ? `/${mode}` : ""),
            {
                headers: {
                    authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
                },
            }
        );

        const res = req.data;

        consoleCheck("beatmap fetcher", `Beatmapset ${beatmapset_id} found!`);

        return {
            status: 200,
            data: res,
        };
    } catch (e: any) {
        consoleError("beatmap fetcher", "Wtf an error:");
        console.error(e);

        return {
            status: 500,
            data: e,
        };
    }
}

export async function searchBeatmapset(
    query: string,
    mode?: string,
    status?: string,
    stars?: string,
    genre?: BeatmapGenre,
    language?: BeatmapLanguage,
    page?: number
): Promise<HTTPResponse<BeatmapsetSearchResponse>> {
    try {
        consoleLog("beatmap fetcher", `Searching beatmapsets "${query}"`);

        const url = new URL("https://osu.ppy.sh/api/v2/beatmapsets/search");

        genre ? url.searchParams.set("g", genre) : void {};
        language ? url.searchParams.set("l", language) : void {};
        status ? url.searchParams.set("s", status) : void {};
        mode ? url.searchParams.set("m", mode) : void {};
        page ? url.searchParams.set("o", page.toString()) : void {};

        if (stars) {
            url.searchParams.set("q", `${query} stars${stars}`);
        } else {
            url.searchParams.set("q", `${query}`);
        }

        const req = await axios(url.href, {
            headers: {
                authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
            },
        });

        const res = req.data;

        consoleCheck("beatmap fetcher", `Searching beatmapsets "${query}" results found!`);

        return {
            status: 200,
            data: res,
        };
    } catch (e: any) {
        consoleError("beatmap fetcher", "Wtf an error:");
        console.error(e);

        return {
            status: 500,
            data: e,
        };
    }
}

export async function download(beatmapset_id: string): Promise<
    IHTTPResponse<{
        name: string;
        size: number;
        buffer: Buffer;
    } | null>
> {
    try {
        consoleLog("beatmap fetcher", `Downloading beatmapset ${beatmapset_id}`);

        const account = {
            username: process.env.OSU_USERNAME ?? "username",
            password: process.env.OSU_PASSWORD ?? "password",
        };
        // get session from username and password
        const session = await OsuAuthenticator.login(account);
        // construct new OsuOfficialDownloader
        const bmsDownloader = new OsuOfficialDownloader(new FetchDownloadClient(), session);
        // download beatmapset with id 1220040
        const downloader = await bmsDownloader.download({
            beatmapsetId: beatmapset_id,
            noVideo: true,
        });

        const filename = await downloader.name();
        const data = await downloader.buffer();
        const size = await downloader.size();

        consoleCheck("beatmap fetcher", `Beatmapset ${beatmapset_id} downloaded!`);

        return {
            status: 200,
            data: {
                name: filename,
                size: size,
                buffer: data,
            },
        };
    } catch (e: any) {
        consoleError("beatmap fetcher", "Wtf an error:");
        console.error(e);

        return {
            status: 500,
            data: e,
        };
    }
}

export async function featuredBeatmapsets(page?: number): Promise<{
    status: number;
    data: {
        beatmapsets: Beatmapset[];
    };
}> {
    try {
        consoleLog("beatmap fetcher", `Fetching featured beatmapsets`);

        page = page ? page : 0;

        const req = await axios(
            `https://osu.ppy.sh/api/v2/beatmapsets/search?sort=plays_desc&page=${page}`,
            {
                headers: {
                    authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
                },
            }
        );

        const res = req.data;

        consoleCheck("beatmap fetcher", `Featured beatmapsets found!`);

        return {
            status: 200,
            data: res,
        };
    } catch (e: any) {
        consoleError("beatmap fetcher", "Wtf an error:");
        console.error(e);

        return {
            status: 500,
            data: e,
        };
    }
}

export async function osuFile(beatmap_id: number | string): Promise<{
    status: number;
    data: string;
}> {
    try {
        consoleLog("beatmap fetcher", `Fetching osu file for ${beatmap_id}`);

        const req = await axios(`https://osu.ppy.sh/osu/${beatmap_id}`);

        const res = req.data;

        consoleCheck("beatmap fetcher", `Osu file for ${beatmap_id} found!`);

        return {
            status: 200,
            data: res,
        };
    } catch (e: any) {
        consoleError("beatmap fetcher", "Wtf an error:");
        console.error(e);

        return {
            status: 500,
            data: e,
        };
    }
}

export async function beatmapsetDiscussionPost(
    post_id: string,
    type: string
): Promise<BeatmapsetDiscussionPostResponse> {
    try {
        consoleLog("beatmap fetcher", `Fetching beatmapset discussion post ${post_id}`);

        const req = await axios(
            `https://osu.ppy.sh/api/v2/beatmapsets/discussions/posts?beatmapset_discussion_id=${post_id}&types[]=${type}&limit=500`,
            {
                headers: {
                    authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
                },
            }
        );

        const res = req.data;

        consoleCheck("beatmap fetcher", `Beatmapset discussion post ${post_id} found!`);

        return {
            status: 200,
            data: res,
        };
    } catch (e: any) {
        consoleError("beatmap fetcher", "Wtf an error:");
        console.error(e);

        return {
            status: 500,
            data: e,
        };
    }
}

export async function beatmapsetDiscussion(
    beatmapset_id: string | number,
    type: string
): Promise<{
    status: number;
    data: BeatmapsetDiscussion;
}> {
    try {
        consoleLog("beatmap fetcher", `Fetching beatmapset discussion ${beatmapset_id}`);

        const req = await axios(
            `https://osu.ppy.sh/api/v2/beatmapsets/discussions?message_types[]=${type}&sort=id_desc&beatmapset_id=${beatmapset_id}`,
            {
                headers: {
                    authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
                },
            }
        );

        const res = req.data;

        consoleCheck("beatmap fetcher", `Beatmapset discussion ${beatmapset_id} found!`);

        return {
            status: 200,
            data: res,
        };
    } catch (e: any) {
        consoleError("beatmap fetcher", "Wtf an error:");
        console.error(e);

        return {
            status: 500,
            data: e,
        };
    }
}

export async function beatmapsetDiscussionVotes(
    post_id: string,
    type: string
): Promise<BeatmapsetDiscussionVoteResponse> {
    try {
        consoleLog("beatmap fetcher", `Fetching beatmapset discussion votes ${post_id}`);

        const req = await axios(
            `https://osu.ppy.sh/api/v2/beatmapsets/discussions/votes?beatmapset_discussion_id=${post_id}&types[]=${type}&limit=500`,
            {
                headers: {
                    authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
                },
            }
        );

        consoleCheck("beatmap fetcher", `Beatmapset discussion votes ${post_id} found!`);

        return {
            status: 200,
            data: req.data,
        };
    } catch (e: any) {
        consoleError("beatmap fetcher", "Wtf an error:");
        console.error(e);

        return {
            status: 500,
            data: e,
        };
    }
}

export async function BeatmapPreview(
    beatmapset_id: string
): Promise<{ status: number; data: string }> {
    try {
        consoleLog("beatmap fetcher", `Fetching beatmapset preview ${beatmapset_id}`);

        const req = await axios(`https://b.ppy.sh/preview/${beatmapset_id}.mp3`, {
            headers: {
                authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
                accept: "audio/mp3",
            },
        });

        const res = req.data;

        consoleCheck("beatmap fetcher", `Beatmapset preview ${beatmapset_id} found!`);

        return {
            status: 200,
            data: res,
        };
    } catch (e: any) {
        consoleError("beatmap fetcher", "Wtf an error:");
        console.error(e);

        return {
            status: 500,
            data: e,
        };
    }
}

export async function basicUserBeatmap(
    user_id: string | number,
    type: string,
    limit?: number,
    offset?: number
) {
    try {
        consoleLog("beatmap fetcher", `fetching basic user beatmaps data for ${user_id}`);

        const req = await axios(
            `https://osu.ppy.sh/api/v2/users/${user_id}/beatmapsets/${type}?limit=${
                limit || 500
            }&offset=${offset || 0}`,
            {
                headers: {
                    authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
                    accept: "audio/mp3",
                },
            }
        );

        const res = req.data;

        consoleCheck("beatmap fetcher", `basid user beatmaps data for ${user_id} found!`);

        return {
            status: 200,
            data: res,
        } as IHTTPResponse<Beatmapset[]>;
    } catch (error) {
        consoleCheck("beatmap fetcher", `basid user beatmaps error:`);
        console.error(error);

        return {
            status: 500,
            data: null,
        } as IHTTPResponse<null>;
    }
}

export async function userBeatmaps(
    user_id: string | number,
    limit?: number,
    offset?: number
): Promise<UserBeatmapetsResponse> {
    try {
        consoleLog("beatmap fetcher", `Fetching user (${user_id}) beatmapsets `);

        // * =============== Data fetching
        let search_types = ["graveyard", "loved", "pending", "ranked"];

        let awaitBeatmaps = new Promise<any>((resolve, reject) => {
            // ? Return value
            let _r: Array<any> = [];
            let state = 0;

            search_types.forEach(async (status) => {
                try {
                    let b = await axios(
                        `https://osu.ppy.sh/api/v2/users/${user_id}/beatmapsets/${status}?limit=${
                            limit || 500
                        }&offset=${offset || 0}`,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
                            },
                        }
                    );

                    let res: Array<any> = b.data;

                    for (let i = 0; i < res.length; i++) {
                        _r.push(res[i]);
                    }

                    state++;

                    if (state == 4) resolveData();
                } catch (e) {
                    console.error(e);

                    resolveData();
                }
            });

            function resolveData() {
                // ? Sort beatmaps by date
                _r.sort((a, b) => {
                    return Number(a.id) - Number(b.id);
                });

                function getSetsData() {
                    let _d = {
                        plays: 0,
                        favourites: 0,
                    };

                    for (let i = 0; i < _r.length; i++) {
                        _d.favourites += Number(_r[i].favourite_count);

                        _d.plays += Number(_r[i].play_count);
                    }

                    return _d;
                }

                let sets_data = getSetsData();

                return resolve({
                    status: 200,
                    data: {
                        sets: _r,
                        last: _r[_r.length - 1],
                        first: _r[0],
                        sets_playcount: sets_data.plays,
                        sets_favourites: sets_data.favourites,
                    },
                });
            }
        });

        let data = await awaitBeatmaps;

        return data;
    } catch (e: any) {
        consoleError("beatmap fetcher", "Wtf an error:");
        console.error(e);

        return {
            status: 500,
            data: e,
        };
    }
}
