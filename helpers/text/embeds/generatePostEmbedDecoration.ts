import { QatEvent } from "types/qat";
import { DiscussionAttributtes } from "../../../modules/osu/url/getTargetDiscussionPost";
import { BeatmapsetDiscussionPost } from "../../../types/beatmap";

export default (
    raw_posts: BeatmapsetDiscussionPost,
    post: DiscussionAttributtes,
    qatData: QatEvent | undefined,
    post_filter_types: string
) => {
    const post_types: any = {
        praise: {
            name: "Praise",
            emoji: "<:praise:957733966947966976>",
        },
        hype: {
            name: "Hype",
            emoji: "<:hype:957733964712394812>",
        },
        nominate: {
            name: "Nomination",
            emoji: "💭",
        },
        qualify: {
            name: "Qualify",
            emoji: "❤️",
        },
        disqualify: {
            name: "Disqualify",
            emoji: "💔",
        },
        nomination_reset: {
            name: "Nomination Reset",
            emoji: "🗯️",
        },
        problem: {
            name: "Problem",
            emoji: "<:problem:957733964586561617>",
        },
        suggestion: {
            name: "Suggestion",
            emoji: "<:suggestion:957733964628521053>",
        },
        mapper_note: {
            name: "Note",
            emoji: "<:mapper_note:957733964611731466>",
        },
        reply: {
            name: "Reply",
            emoji: "<:message1:957738115076857856>",
        },
    };

    if (
        raw_posts.posts.length > 1 ||
        (raw_posts.posts.length == 1 && post_filter_types == "reply") ||
        !post.discussions[0]
    )
        return {
            color: "#ffffff",
            title: `${post_types["reply"].emoji}  ${post_types["reply"].name}`,
        };

    const colors: any = {
        suggestion: "#c6a132",
        problem: "#c33c33",
        qualify: "#ff4b63",
        disqualify: "#ff4b63",
        hype: "#3399cc",
        praise: "#3399cc",
        nominate: "#3399cc",
        nomination_reset: "#3399cc",
        resolved: "#80cc33",
        mapper_note: "#6851b6",
    };

    if (qatData) {
        return {
            color: colors[qatData.type],
            title: `${post_types[qatData.type].emoji}  ${
                post_types[qatData.type].name
            }`,
        };
    }

    if (post.discussions[0] && post.discussions[0].resolved)
        return {
            color: colors["resolved"],
            title: `${
                post_types[post.discussions[0].message_type].emoji
            } <:resolved:957733964649480252>  Closed ${
                post.discussions[0].message_type
            } `,
        };

    return {
        color: colors[post.discussions[0].message_type],
        title: `${post_types[post.discussions[0].message_type].emoji}  ${
            post_types[post.discussions[0].message_type].name
        }`,
    };
};
