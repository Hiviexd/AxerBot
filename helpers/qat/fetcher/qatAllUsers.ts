import axios from "axios";
import { QatAllUsersResponse } from "../../../types/qat";
import { consoleCheck, consoleError, consoleLog } from "../../core/logger";

export async function allUsers():Promise<QatAllUsersResponse> {
    try{
        consoleLog("qatUser fetcher", `Fetching all BNs/NATs`);

        const req = await axios(
            `https://bn.mappersguild.com/interOp/users/`,
            {
                headers: {
                    username: `${process.env.QAT_USER}`,
                    secret: `${process.env.QAT_SECRET}`,
                },
            }
        );

        const res = req.data;

        consoleCheck("qatUser fetcher", `Fetched all users!`);

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
