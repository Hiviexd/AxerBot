import { QatUserResponse } from "../../../../types/qat";

export default function getRequestStatus(
    user: QatUserResponse
): string {
    let requestStatus = user.data.requestStatus;

    requestStatus = requestStatus.filter(status => status !== "closed");

    return requestStatus.join(", ")
    .replace("personalQueue", `${user.data.requestLink ? `[personal queue](${user.data.requestLink})` : `personal queue (no link)`}`)
    .replace("globalQueue", "[global queue](https://bn.mappersguild.com/modrequests/listing)")
    .replace("gameChat", "game chat");
}
