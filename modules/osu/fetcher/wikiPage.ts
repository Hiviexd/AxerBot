import axios from "axios";
import { consoleCheck, consoleError, consoleLog } from "../../../helpers/core/logger";
import { WikiPageResponse } from "../../../types/wiki";

export async function wikiPage(locale: string, path: string): Promise<WikiPageResponse> {
    try {
        consoleLog("wiki fetcher", `Fetching wiki page ${locale}/${path}`);

        const req = await axios(`https://osu.ppy.sh/api/v2/wiki/${locale}/${path}`, {
            headers: {
                authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
            },
        });

        const res = req.data;

        consoleCheck("wiki fetcher", `wiki page ${locale}/${path} found!`);

        return {
            status: 200,
            data: res,
        };
    } catch (e: any) {
        consoleError("wiki fetcher", "Error:");
        console.error(e);

        return {
            status: 500,
            data: e,
        };
    }
}
