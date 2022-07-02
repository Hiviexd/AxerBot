import { QatUser } from "../../../../types/qat";
import getRequestStatus from "./getRequestStatus";

let parseUsergroupFromQatUser = (user: QatUser): string => {
	let usergroup = "";
	if (user.groups.includes("nat")) {
		usergroup = "<:1nat:992500805527674940>";
	} else if (user.groups.includes("bn") && user.probationModes.length === 0) {
		usergroup = "<:2bn:992500782274457702>";
	} else usergroup = "<:3probo:992500821591867442>";
	return usergroup;
};

export default function getOpenBNsPerMode(
	openBNs: QatUser[],
	mode: string,
	type: "link" | "status"
): string {
	let bns = [];

	let parseUsergroupFromQatUser = (user: QatUser): string => {
		let usergroup = "";
		if (user.groups.includes("nat")) {
			usergroup = "<:1nat:992500805527674940>";
		} else if (
			user.groups.includes("bn") &&
			user.probationModes.length === 0
		) {
			usergroup = "<:2bn:992500782274457702>";
		} else usergroup = "<:3probo:992500821591867442>";
		return usergroup;
	};

	for (let openBN of openBNs) {
		if (openBN.modesInfo.find((m) => m.mode === mode)) {
			switch (type) {
				case "link":
					bns.push();
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
