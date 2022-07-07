import { QatUser } from "../../../../types/qat";
import getRequestStatus from "./getRequestStatus";

let parseUsergroupFromQatUser = (user: QatUser): string => {
	let usergroup = "";
	if (user.groups.includes("nat")) {
		usergroup = "🟠";
	} else if (user.groups.includes("bn") && user.probationModes.length === 0) {
		usergroup = "🟣";
	} else usergroup = "⚪";
	return usergroup;
};

export default function getOpenBNsPerMode(
	openBNs: QatUser[],
	mode: string,
	type: "link" | "status"
): string {
	let bns = [];
	for (let openBN of openBNs) {
		if (openBN.modesInfo.find((m) => m.mode === mode)) {
			switch (type) {
				case "link":
					bns.push(
						`${parseUsergroupFromQatUser(openBN)} [${
							openBN.username
						}](https://osu.ppy.sh/users/${openBN.osuId})`
					);
					break;
				case "status":
					bns.push(
						`**${parseUsergroupFromQatUser(openBN)} [${
							openBN.username
						}](https://osu.ppy.sh/users/${
							openBN.osuId
						})** (${getRequestStatus(openBN)})`
					);
					break;
				default:
					break;
			}
		}
	}

	return bns.sort().join("\n");
}
