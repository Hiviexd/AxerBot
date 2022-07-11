import { QatUser } from "../../../../types/qat";

export default function getRequestStatus(user: QatUser): string {
	let requestStatus = user.requestStatus;

	requestStatus = requestStatus.filter((status) => status !== "closed");

	return requestStatus
		.join(", ")
		.replace(
			"personalQueue",
			`${
				user.requestLink
					? `[personal queue](${user.requestLink})`
					: `personal queue (no link)`
			}`
		)
		.replace(
			"globalQueue",
			"[global queue](https://bn.mappersguild.com/modrequests/listing)"
		)
		.replace("gameChat", "game chat");
}
