import {
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
import { user, userRecent, users } from "./user";
import { comment } from "./comment";
import { fetchBeatmapEvents } from "./qat";
import { downloadUnofficialReplay } from "./downloader/replay/downloadUnofficialReplay";

export default {
    fetch: {
        beatmap: beatmap,
        beatmapset: beatmapset,
        searchBeatmapset: searchBeatmapset,
        featuredBeatmapsets: featuredBeatmapsets,
        beatmapsetDiscussionPost: beatmapsetDiscussionPost,
        beatmapsetDiscussion: beatmapsetDiscussion,
        beatmapsetDiscussionVotes: beatmapsetDiscussionVotes,
        discussionEvents: fetchBeatmapEvents,
        user: user,
        users,
        basicUserBeatmaps: basicUserBeatmap,
        userBeatmaps: userBeatmaps,
        userRecent: userRecent,
        comment: comment,
        osuFile: osuFile,
    },
    download: {
        beatmapset: download,
        unofficialReplay: downloadUnofficialReplay,
    },
};
