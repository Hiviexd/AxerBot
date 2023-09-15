import axios from "axios";
import { consoleCheck, consoleError, consoleLog } from "../../../helpers/core/logger";
import { IHTTPResponse } from "../../../types/http";
import { UserCompact } from "../../../types/user";

export async function kudosu(page?: number): Promise<IHTTPResponse<UserCompact[]>> {
    try {
        consoleLog("rankings fetcher", `Fetching kudosu rankings`);
        let url = "https://osu.ppy.sh/api/v2/rankings/kudosu";
        if (page) url += `?page=${page}`;

        const req = await axios(url, {
            headers: {
                authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
            },
        });

        const res = req.data.ranking;

        consoleCheck(
            "rankings fetcher",
            `kudosu rankings ${page ? `(page ${page})` : null} fetched!`
        );

        return {
            status: 200,
            data: res,
        };
    } catch (e: any) {
        consoleError("rankings fetcher", "Error:");
        console.error(e);

        return {
            status: 500,
            data: e,
        };
    }
}
