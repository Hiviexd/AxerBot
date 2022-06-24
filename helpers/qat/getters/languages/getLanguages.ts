import { UserActivityResponse } from "../../../../types/qat";

export default function getLanguages(
    activity: UserActivityResponse
): string[] {
    const languages = [];
    for (const nomination of activity.data.uniqueNominations) {
            languages.push(nomination.language);
    }
    return languages;
}
