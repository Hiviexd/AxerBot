import axios from "axios";
import { QatUserResponse } from "../../../types/qat";
import { consoleCheck, consoleError, consoleLog } from "../../core/logger";

export async function user(
    userId: number
):Promise<QatUserResponse> {
    try{
        consoleLog("qatUser fetcher", `Fetching user ${userId}`);

        const req = await axios(
            `https://bn.mappersguild.com/interOp/users/${userId}`,
            {
                headers: {
                    username: `${process.env.QAT_USER}`,
                    secret: `${process.env.QAT_SECRET}`,
                },
            }
        );

        const res = req.data;

        consoleCheck("qatUser fetcher", `user ${userId} found!`);

        return {
            status: 200,
            data: res,
        };
    } catch (e: any) {
		consoleError("qatUser fetcher", "Encountered an error:");
		console.error(e);

		return {
			status: 500,
			data: e,
		};
	}
}
