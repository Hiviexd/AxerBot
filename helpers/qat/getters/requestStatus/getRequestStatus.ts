import { QatUser } from "../../../../types/qat";

export default function getRequestStatus(user: QatUser): string {
	let requestStatus = user.requestStatus;

	requestStatus = requestStatus.filter((status) => status !== "closed");

	return requestStatus
    //sort alphabetically
        .sort()
		.join(", ")
		.replace(
			"personalQueue",
			`${
				user.requestLink
					? `[queue](${user.requestLink})`
					: `queue (no link)`
			}`
		)
		.replace("gameChat", "chat");
}
