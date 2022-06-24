import { UserActivityResponse } from "../../../../types/qat";

export default function getGenres(
    activity: UserActivityResponse
): string[] {
    const genres = [];
    for (const nomination of activity.data.uniqueNominations) {
            genres.push(nomination.genre);
    }
    return genres;
}