import { Message } from "discord.js";

import qatApi from "../../../helpers/qat/fetcher/qatApi";
import BeatmapsetDiscussionEmbed from "../../../responses/osu/BeatmapsetDiscussionEmbed";
import osuApi from "../fetcher/osuApi";
import getDiscussionURLParams from "./getDiscussionURLParams";
import getTargetDiscussionPost from "./getTargetDiscussionPost";

export default async (url: string, message?: Message) => {
    const postInfo = getDiscussionURLParams(url);

    if (postInfo.post == "") return;

    const post = await osuApi.fetch.beatmapsetDiscussionPost(
        postInfo.post,
        postInfo.type
    );

    if (post.status != 200) return;

    const targetPost = getTargetDiscussionPost(postInfo, post);

    if (!targetPost) return;

    const events = await qatApi.fetch.events(postInfo.beatmapset);

    const targetEvent =
        events.data && events.data.length
            ? events.data.find(
                  (e) =>
                      (e.discussionId == targetPost.discussions[0]?.id ||
                          e.content == targetPost.posts[0]?.message) &&
                      e.userId == targetPost.posts[0]?.user_id
              )
            : undefined;

    if (message) {
        BeatmapsetDiscussionEmbed.send(
            targetPost,
            post.data,
            postInfo.type,
            targetEvent,
            message,
            url
        );
    }
};
