import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message } from "discord.js";
import { QatEvent } from "types/qat";
import generatePostEmbedDecoration from "../../helpers/text/embeds/generatePostEmbedDecoration";
import generateColoredModeIcon from "../../helpers/text/generateColoredModeIcon";
import getEmoji from "../../helpers/text/getEmoji";
import parseOsuTimestamps from "../../helpers/text/parseOsuTimestamps";
import truncateString from "../../helpers/text/truncateString";
import osuApi from "../../modules/osu/fetcher/osuApi";
import getHighestUsergroup from "../../modules/osu/player/getHighestUsergroup";
import { DiscussionAttributtes } from "../../modules/osu/url/getTargetDiscussionPost";
import { BeatmapsetDiscussionPost } from "../../types/beatmap";

export default {
    send: async (
        post: DiscussionAttributtes,
        raw_posts: BeatmapsetDiscussionPost,
        type: string,
        qatData: QatEvent | undefined,
        message: Message,
        url: string
    ) => {
        if (post.posts.length < 1) return;
        const author = await osuApi.fetch.user(String(post.posts[0].user_id));
        const usergroup = getHighestUsergroup(author.data); // ? Get the highest usergroup

        const embedDecoration = generatePostEmbedDecoration(raw_posts, post, qatData, type);

        const beatmap = await osuApi.fetch.beatmapset(post.beatmapsets[0].id.toString());

        if (!beatmap.data.beatmaps) return;

        const metadata = `
		**[${post.beatmapsets[0].artist} - ${
            post.beatmapsets[0].title
        }](${url})**\n${generateModeIcon()} Mapped by [${
            post.beatmapsets[0].creator
        }](https://osu.ppy.sh/users/${post.beatmapsets[0].user_id})\n\n`;

        function generateModeIcon() {
            if (!beatmap.data.beatmaps) return;

            const beatmapData = beatmap.data.beatmaps.find(
                (b) => b.id == post.discussions[0].beatmap_id
            );

            if (!post.discussions[0].beatmap_id || !beatmapData) {
                return getEmoji(beatmap.data.beatmaps[0].mode);
            }
            return generateColoredModeIcon(beatmapData?.mode, beatmapData?.difficulty_rating);
        }

        function getPostLocation() {
            if (!post.discussions[0].beatmap_id) return "General (All difficulties)";

            if (!beatmap.data.beatmaps) return "General (All difficulties)";

            const beatmapData = beatmap.data.beatmaps.find(
                (b) => b.id == post.discussions[0].beatmap_id
            );

            if (!beatmapData) return "General (All difficulties)";

            const sanitizedDiffname =
                beatmapData.version.length > 40
                    ? beatmapData.version.slice(0, 40) + "..."
                    : beatmapData.version;

            if (url.includes("general") && !url.includes("generalAll"))
                return `General (${sanitizedDiffname})`;

            if (url.includes("timeline")) return `Timeline (${sanitizedDiffname})`;
        }

        let e = new EmbedBuilder({
            description: parseOsuTimestamps(
                truncateString(metadata.concat(post.posts[0].message), 1024)
            ),
            thumbnail: {
                url: `https://b.ppy.sh/thumb/${post.beatmapsets[0].id}l.jpg`,
            },
            author: {
                iconURL: `https://a.ppy.sh/${post.posts[0].user_id}`,
                url: `https://osu.ppy.sh/users/${post.posts[0].user_id}`,
                name: `${author.data.username} ${
                    usergroup.name ? `(${usergroup.short_name})` : ""
                }`,
            },
            footer: {
                text: `${getPostLocation()}`,
            },
            timestamp: new Date(post.posts[0].created_at),
        })
            .setTitle(embedDecoration.title)
            .setColor(embedDecoration.color);

        const buttons = new ActionRowBuilder<ButtonBuilder>();

        if (beatmap.status == 200 && beatmap.data.beatmaps) {
            buttons.addComponents([
                new ButtonBuilder({
                    style: ButtonStyle.Link,
                    url: `https://axer-url.vercel.app/api/direct?map=${beatmap.data.beatmaps[0].id}`,
                    label: "osu!direct",
                }),
                new ButtonBuilder({
                    style: ButtonStyle.Primary,
                    customId: `beatmap_download|${beatmap.data.id}`,
                    label: "Quick download",
                }),
            ]);
        }

        message.reply({
            embeds: [e],
            components: [buttons],
            allowedMentions: {
                repliedUser: false,
            },
        });
    },
};
