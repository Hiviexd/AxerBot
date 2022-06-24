import { UserActivityResponse } from "../../../../types/qat";
import getGenres from "./getGenres";
export default function getTop3Genres( activity: UserActivityResponse ): string {
    if (activity.data.uniqueNominations.length === 0) {
        return "-";
    }
    const genres = getGenres(activity);
    //return frequency of each genre in array
    const genreFrequency = genres.reduce((acc, cur) => {
        acc[cur] = (acc[cur] || 0) + 1;
        return acc;
    }
    //sort genres by frequency
    , {} as { [key: string]: number });
    
    // return array of sorted genres with frequency
    const sortedGenreFrequency = Object.entries(genreFrequency).sort((a, b) => b[1] - a[1]).slice(0, 3);

    let res = "";
    for (const [key, value] of sortedGenreFrequency) {
        res += `${key} (${value}) \n`;
    }

    return res;
}
