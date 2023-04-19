import axios from "axios";
import {
    consoleCheck,
    consoleError,
    consoleLog,
} from "../../../helpers/core/logger";
import { IHTTPResponse } from "../../../types/http";
import { UserScoreResponse } from "../../../types/score";
import { User, UserRecentEvent, UserResponse } from "../../../types/user";

export async function user(
    user_id: string,
    mode?: string
): Promise<UserResponse> {
    try {
        consoleLog("user fetcher", `Fetching user ${user_id}`);

        const req = await axios(parseMode(), {
            headers: {
                authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
            },
        });

        const res = req.data;

        consoleCheck("user fetcher", `user ${user_id} found!`);

        function parseMode() {
            let link = "https://osu.ppy.sh/api/v2/users/".concat(user_id);

            if (mode) {
                link = `https://osu.ppy.sh/api/v2/users/${user_id}/${mode}`;
            }

            return link;
        }

        return {
            status: 200,
            data: res,
        };
    } catch (e: any) {
        consoleError("user fetcher", "Wtf an error:");
        console.error(e);

        return {
            status: 500,
            data: e,
        };
    }
}

export async function userRecentActivity(
    user_id: string
): Promise<IHTTPResponse<UserRecentEvent[]>> {
    try {
        consoleLog("user fetcher", `Fetching user recent activity ${user_id}`);

        const req = await axios(
            `https://osu.ppy.sh/api/v2/users/${user_id}/recent_activity`,
            {
                headers: {
                    authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
                },
            }
        );

        const res = req.data;

        consoleCheck("user fetcher", `user ${user_id} recent activity found!`);

        return {
            status: 200,
            data: res,
        };
    } catch (e: any) {
        consoleError("user fetcher", "Wtf an error:");
        console.error(e);

        return {
            status: 500,
            data: e,
        };
    }
}

export async function users(
    ids: string[],
    mode?: string
): Promise<IHTTPResponse<User[]>> {
    try {
        consoleLog("user fetcher", `Fetching users`);

        let url = "https://osu.ppy.sh/api/v2/users?";
        ids.forEach((id) => {
            url = url.concat(`ids[]=${id}&`);
        });

        const req = await axios(url, {
            headers: {
                authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
            },
        });

        const res = req.data.users;

        consoleCheck("user fetcher", `user found!`);

        return {
            status: 200,
            data: res,
        };
    } catch (e: any) {
        consoleError("user fetcher", "Wtf an error:");
        console.error(e);

        return {
            status: 500,
            data: e,
        };
    }
}

export async function userRecent(
    user_id: string,
    include_fails?: number,
    mode?: string
): Promise<UserScoreResponse> {
    try {
        consoleLog("user fetcher", `Fetching user ${user_id} recent scores`);

        const req = await axios(parseMode(), {
            headers: {
                authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
            },
        });

        const res = req.data;

        consoleCheck("user fetcher", `user ${user_id} recent scores found!`);

        if (!include_fails) include_fails = 1;

        function parseMode() {
            let link = `https://osu.ppy.sh/api/v2/users/${user_id}/scores/recent?include_fails=${include_fails}`;

            if (mode) {
                link = `https://osu.ppy.sh/api/v2/users/${user_id}/scores/recent?include_fails=${include_fails}&mode=${mode}`;
            }

            return link;
        }

        return {
            status: 200,
            data: res,
        };
    } catch (e: any) {
        consoleError("user fetcher", "Wtf an error:");
        console.error(e);

        return {
            status: 500,
            data: e,
        };
    }
}
