import {
    Message,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonStyle,
    ButtonBuilder,
} from "discord.js";
import { ParsedComment } from "../../helpers/osu/url/parseComment";
import truncateString from "../../helpers/text/truncateString";
import colors from "../../constants/colors";

export default {
    async send(comment: ParsedComment, message: Message) {
        const labels = {
            build: "Go to changelog",
            news_post: "Go to news post",
            beatmapset: "Go to beatmap",
        };

        const buttons = new ActionRowBuilder<ButtonBuilder>();
        buttons.addComponents(
            new ButtonBuilder({
                style: ButtonStyle.Link,
                label: labels[comment.postType],
                url: comment.url,
            })
        );

        const embed = new EmbedBuilder({
            author: {
                name: comment.user.username,
                iconURL: comment.user.avatar_url,
                url: `https://osu.ppy.sh/users/${comment.user.id}`,
            },
            title: `${
                comment.type == "Comment"
                    ? `💬 Comment`
                    : `🗨️ Reply ▶️ ${comment.repliedAuthor?.username}`
            }`,
            description: `**[${comment.title}](https://osu.ppy.sh/comments/${
                comment.id
            })**\n\n${truncateString(comment.content, 2048)}`,
            footer: {
                text: `+${comment.votes}`,
            },
            timestamp: comment.created_at,
        }).setColor(comment.type == "Comment" ? colors.pink : colors.purple);

        message.reply({
            allowedMentions: {
                repliedUser: false,
            },
            embeds: [embed],
            components: [buttons],
        });
    },
};
