import axios from "axios";
import { CommentResponse } from "../../../types/comment";
import { consoleCheck, consoleError, consoleLog } from "../../core/logger";

export async function comment(comment_id: string): Promise<CommentResponse> {
	try {
		consoleLog("comment fetcher", `Fetching comment ${comment_id}`);

		const req = await axios(
			`https://osu.ppy.sh/api/v2/comments/${comment_id}`,
			{
				headers: {
					authorization: `Bearer ${process.env.OSU_API_ACCESS_TOKEN}`,
				},
			}
		);

		const res = req.data;

		consoleCheck("comment fetcher", `comment ${comment_id} found!`);

		return {
			status: 200,
			data: res,
		};
	} catch (e: any) {
		consoleError("comment fetcher", "Wtf an error:");
		console.error(e);

		return {
			status: 500,
			data: e,
		};
	}
}
