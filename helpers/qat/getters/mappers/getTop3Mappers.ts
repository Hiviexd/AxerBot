import { UserActivityResponse } from "../../../../types/qat";
import getMappers from "./getMappers";
export default function getTop3Mappers( activity: UserActivityResponse ): string {
    if (activity.data.uniqueNominations.length === 0) {
        return "-";
    }
    const mappers = getMappers(activity);
    //return frequency of each mapper in array
    const mapperFrequency = mappers.reduce((acc, cur) => {
        acc[cur] = (acc[cur] || 0) + 1;
        return acc;
    }
    //sort mappers by frequency
    , {} as { [key: string]: number });

   // return array of sorted mappers with frequency
    const sortedMapperFrequency = Object.entries(mapperFrequency).sort((a, b) => b[1] - a[1]).slice(0, 3);

    let res = "";
    for (const [key, value] of sortedMapperFrequency) {
        res += `${key} (${value}) \n`;
    }

    return res;
}
