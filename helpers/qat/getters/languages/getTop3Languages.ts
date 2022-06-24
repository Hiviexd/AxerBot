import { UserActivityResponse } from "../../../../types/qat";
import getlanguages from "./getLanguages";
export default function getTop3Languages( activity: UserActivityResponse ): string {
    if (activity.data.uniqueNominations.length === 0) {
        return "-";
    }
    const languages = getlanguages(activity);
    //return frequency of each language in array
    const languageFrequency = languages.reduce((acc, cur) => {
        acc[cur] = (acc[cur] || 0) + 1;
        return acc;
    }
    //sort languages by frequency
    , {} as { [key: string]: number });
    
    // return array of sorted languages with frequency
    const sortedlanguageFrequency = Object.entries(languageFrequency).sort((a, b) => b[1] - a[1]).slice(0, 3);

    let res = "";
    for (const [key, value] of sortedlanguageFrequency) {
        res += `${key} (${value}) \n`;
    }

    return res;
}