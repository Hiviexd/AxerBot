import { UserActivityResponse } from "../../../../types/qat";

// https://stackoverflow.com/a/9229821/16164887
export default function getUniqueMappersNumber( activity: UserActivityResponse ): number {
    return new Set(activity.data.uniqueNominations.map(nomination => nomination.creatorId)).size;
}
