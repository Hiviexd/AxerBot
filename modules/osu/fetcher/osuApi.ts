import {
    allBeatmapsetEvents,
    basicUserBeatmap,
    beatmap,
    beatmapset,
    beatmapsetDiscussion,
    beatmapsetDiscussionPost,
    beatmapsetDiscussionVotes,
    download,
    featuredBeatmapsets,
    osuFile,
    searchBeatmapset,
    userBeatmaps,
} from "./beatmap";
import { user, userRecent, userRecentActivity, users } from "./user";
import { comment } from "./comment";
import { fetchBeatmapEvents } from "./qat";
import { downloadUnofficialReplay } from "./downloader/replay/downloadUnofficialReplay";
import { kudosu } from "./rankings";
import { wikiPage } from "./wikiPage";

export default {
    fetch: {
        beatmap: beatmap,
        beatmapset: beatmapset,
        allBeatmapsetEvents: allBeatmapsetEvents,
        searchBeatmapset: searchBeatmapset,
        featuredBeatmapsets: featuredBeatmapsets,
        beatmapsetDiscussionPost: beatmapsetDiscussionPost,
        beatmapsetDiscussion: beatmapsetDiscussion,
        beatmapsetDiscussionVotes: beatmapsetDiscussionVotes,
        discussionEvents: fetchBeatmapEvents,
        user: user,
        userRecentActivity: userRecentActivity,
        users,
        basicUserBeatmaps: basicUserBeatmap,
        userBeatmaps: userBeatmaps,
        userRecent: userRecent,
        comment: comment,
        osuFile: osuFile,
        kudosuRankings: kudosu,
        wikiPage: wikiPage,
    },
    download: {
        beatmapset: download,
        unofficialReplay: downloadUnofficialReplay,
    },
};
