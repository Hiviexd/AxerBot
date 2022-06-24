import { UserActivityResponse } from "../../../../types/qat";

export default function getMappers(
    activity: UserActivityResponse
): string[] {
    const mappers = [];
    for (const nomination of activity.data.uniqueNominations) {
            mappers.push(nomination.creatorName);
    }
    return mappers;
}
