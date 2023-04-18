// import { MapperTrackerType } from "../../commands/osu/mappertracker";
// import { tracks } from "../../database";
// import osuApi from "../../modules/osu/fetcher/osuApi";
// import { existsSync, writeFileSync, readFileSync } from "fs";
// import path from "path";
// import { Beatmapset, CompressedBeatmapset } from "../../types/beatmap";
// import { consoleCheck } from "../../helpers/core/logger";
// import { sendNewBeatmapEmbed } from "../../responses/mappertracker/SendNewBeatmapEmbed";
// import { SendBeatmapQualifyEmbed } from "../../responses/mappertracker/SendBeatmapQualifyEmbed";
// import { sendBeatmapGraveyardEmbed } from "../../responses/mappertracker/SendBeatmapGraveyardEmbed";
// import { sendBeatmapRankedEmbed } from "../../responses/mappertracker/SendBeatmapRankedEmbed";
// import { sendBeatmapLovedEmbed } from "../../responses/mappertracker/SendBeatmapLovedEmbed";
// import { SendBeatmapNominationResetEmbed } from "../../responses/mappertracker/SendBeatmapNominationResetEmbed";
// import { SendBeatmapDisqualifyEmbed } from "../../responses/mappertracker/SendBeatmapDisqualifyEmbed";
// import { SendBeatmapNominationEmbed } from "../../responses/mappertracker/SendBeatmapNominationEmbed";
// import { sendBeatmapHypeEmbed } from "../../responses/mappertracker/SendBeatmapHypeEmbed";
// import { sendBeatmapFavoriteEmbed } from "../../responses/mappertracker/SendBeatmapFavoriteEmbed";

import { MapperTrackerType } from "../../commands/osu/mappertracker";

// export interface IMapperTracker {
//     _id: string;
//     type: "mapper";
//     targetsArray: MapperTrackerType[];
//     userId: string;
//     channel: string;
//     guild: string;
// }

// async function updateTrackers() {
//     const trackers = await tracks.find({ type: "mapper" });

//     for (const tracker of trackers) {
//         checkTracker(tracker as unknown as IMapperTracker);
//     }
// }

// function getStoredDataFile() {
//     return JSON.parse(
//         readFileSync(
//             path.resolve(__dirname + "/../../cache/mappers.json"),
//             "utf8"
//         )
//     );
// }

// function getUserStoredBeatmapsData(id: string | number) {
//     const stored = getStoredDataFile();

//     if (!stored[id])
//         return {
//             status: 404,
//             data: null,
//         };

//     return {
//         status: 200,
//         data: stored[id],
//     };
// }

// function storeFile(data: string) {
//     writeFileSync(
//         path.resolve(__dirname + "/../../cache/mappers.json"),
//         data,
//         "utf8"
//     );

//     consoleCheck("MapperTracker", "Stored database file");
// }

// function updateUserStoredData(beatmaps: Beatmapset[]) {
//     const d = getStoredDataFile();
//     d[beatmaps[0].user_id] = beatmaps.map((b) => {
//         return {
//             id: b.id,
//             hype: b.hype || { current: 0, required: 0 },
//             nominations_summary: b.nominations_summary || {
//                 current: 0,
//                 required: 0,
//             },
//             status: b.status,
//             favorites: b.favourite_count,
//             user_id: b.user_id,
//         };
//     });
//     storeFile(JSON.stringify(d));

//     consoleCheck(
//         "MapperTracker",
//         `Updated user stored data for ${beatmaps[0].user_id}`
//     );
// }

// async function checkTracker(tracker: IMapperTracker) {
//     setTimeout(async () => {
//         const beatmaps = await osuApi.fetch.userBeatmaps(tracker.userId);

//         if (beatmaps.status != 200 || !beatmaps.data) return;

//         const storedData = getUserStoredBeatmapsData(
//             beatmaps.data.first.user_id
//         );

//         if (!storedData || storedData.status != 200)
//             return updateUserStoredData(beatmaps.data.sets);

//         compareData(tracker, beatmaps.data.sets, storedData.data);
//     }, 30000); // Delay to prevent rate limit
// }

// function compareData(
//     tracker: IMapperTracker,
//     currentBeatmaps: Beatmapset[],
//     storedData: CompressedBeatmapset[]
// ) {
//     currentBeatmaps.forEach((map) => {
//         const currentBeatmap = {
//             id: map.id,
//             hype: map.hype || {
//                 current: 0,
//                 required: 0,
//             },
//             nominations_summary: map.nominations_summary || {
//                 current: 0,
//                 required: 0,
//             },
//             status: map.status,
//             favorites: map.favourite_count,
//             user_id: map.user_id,
//         };

//         const referentStoredBeatmap = storedData.find(
//             (b) => b.id == currentBeatmap.id
//         );

//         if (
//             !referentStoredBeatmap &&
//             tracker.targetsArray.includes(MapperTrackerType.NewBeatmap)
//         )
//             sendNewBeatmapEmbed(currentBeatmap, tracker); // New beatmap\

//         if (!referentStoredBeatmap) return;

//         if (
//             currentBeatmap.nominations_summary.current !=
//             referentStoredBeatmap.nominations_summary.current
//         ) {
//             if (
//                 (currentBeatmap.nominations_summary.current || 0) <
//                     (referentStoredBeatmap.nominations_summary.current || 0) &&
//                 tracker.targetsArray.includes(
//                     MapperTrackerType.DisqualifiedBeatmap
//                 )
//             )
//                 SendBeatmapNominationResetEmbed(currentBeatmap, tracker);

//             if (
//                 referentStoredBeatmap.status == "pending" &&
//                 currentBeatmap.status == "qualified" &&
//                 tracker.targetsArray.includes(
//                     MapperTrackerType.QualifiedBeatmap
//                 )
//             )
//                 SendBeatmapQualifyEmbed(currentBeatmap, tracker);

//             if (
//                 (currentBeatmap.nominations_summary.current || 0) == 0 &&
//                 currentBeatmap.status == "pending" &&
//                 referentStoredBeatmap.nominations_summary.current == 2 &&
//                 tracker.targetsArray.includes(
//                     MapperTrackerType.DisqualifiedBeatmap
//                 )
//             )
//                 SendBeatmapDisqualifyEmbed(currentBeatmap, tracker);

//             if (
//                 (currentBeatmap.nominations_summary.current || 0) == 1 &&
//                 currentBeatmap.status == "pending" &&
//                 referentStoredBeatmap.nominations_summary.current == 0 &&
//                 tracker.targetsArray.includes(
//                     MapperTrackerType.BeatmapNomination
//                 )
//             )
//                 SendBeatmapNominationEmbed(currentBeatmap, tracker);
//         }

//         if (
//             currentBeatmap.hype?.current !=
//             (referentStoredBeatmap.hype?.current || 0)
//         ) {
//             if (
//                 currentBeatmap.hype &&
//                 currentBeatmap.hype.current !=
//                     referentStoredBeatmap.hype?.current &&
//                 tracker.targetsArray.includes(MapperTrackerType.NewHype)
//             )
//                 sendBeatmapHypeEmbed(currentBeatmap, tracker);
//         }

//         if (referentStoredBeatmap.status != currentBeatmap.status) {
//             if (
//                 currentBeatmap.status == "graveyard" &&
//                 tracker.targetsArray.includes(
//                     MapperTrackerType.BeatmapGraveyard
//                 )
//             )
//                 sendBeatmapGraveyardEmbed(currentBeatmap, tracker);

//             if (
//                 currentBeatmap.status == "ranked" &&
//                 tracker.targetsArray.includes(MapperTrackerType.RankedBeatmap)
//             )
//                 sendBeatmapRankedEmbed(currentBeatmap, tracker);

//             if (
//                 currentBeatmap.status == "qualified" &&
//                 tracker.targetsArray.includes(
//                     MapperTrackerType.QualifiedBeatmap
//                 )
//             )
//                 SendBeatmapQualifyEmbed(currentBeatmap, tracker);

//             if (
//                 currentBeatmap.status == "loved" &&
//                 tracker.targetsArray.includes(MapperTrackerType.BeatmapLoved)
//             )
//                 sendBeatmapLovedEmbed(currentBeatmap, tracker);
//         } // Status change

//         if (
//             currentBeatmap.favorites > referentStoredBeatmap.favorites &&
//             tracker.targetsArray.includes(MapperTrackerType.BeatmapFavorite)
//         ) {
//             sendBeatmapFavoriteEmbed(currentBeatmap, tracker);
//         }
//     });

//     updateUserStoredData(currentBeatmaps);
// }

// function createDefaultFile() {
//     writeFileSync(
//         path.resolve(__dirname + "/../../cache/mappers.json"),
//         JSON.stringify({}),
//         "utf8"
//     );

//     consoleCheck("MapperTracker", "Created default file!");
// }

// export function listenMapperTracker() {
//     if (!existsSync(path.resolve(__dirname + "/../../cache/mappers.json")))
//         createDefaultFile();

//     setInterval(() => {
//         updateTrackers();
//     }, 1.2e6);
// }

export namespace MapperTracker {
    export interface IMapperTracker {
        _id: string;
        channel: string;
        guild: string;
        targetsArray: MapperTrackerType[];
        type: "mapper";
        userId: string;
    }

    export class Client {
        constructor() {}
    }

    export class Mapper {
        private tracker;

        constructor(tracker: IMapperTracker) {
            this.tracker = tracker;
        }
    }
}
