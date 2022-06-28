import { QatUser } from "../../../../types/qat";
import getRequestStatus from "./getRequestStatus";

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
						`[${openBN.username}](https://osu.ppy.sh/users/${openBN.osuId})`
					);
					break;
				case "status":
					bns.push(
						`**[${openBN.username}](https://osu.ppy.sh/users/${openBN.osuId})** (${getRequestStatus(openBN)})`
					);
					break;
				default:
					break;
			}
		}
	}
	return bns.sort().join("\n");
}
