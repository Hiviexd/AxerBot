import parseDate from "../../../helpers/text/parseDate";
import { UserBeatmapetsResponse } from "../../../types/beatmap";

export default function getMappingAge(beatmaps: UserBeatmapetsResponse) {
    if (!beatmaps.data.first.submitted_date) return "0";

    return parseDate(
        new Date(
            new Date().getTime() -
                new Date(beatmaps.data.first.submitted_date).getTime()
        )
    );
}
