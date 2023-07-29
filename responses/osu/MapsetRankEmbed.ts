import { ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";
import parseUsergroup from "../../modules/osu/player/getHighestUsergroup";
import { Beatmapset } from "../../types/beatmap";
import { UserResponse } from "../../types/user";
import { calculateScoreForBeatmapset } from "../../modules/osu/performance/calculateMapperScore";

export default {
    send: (user: UserResponse, beatmaps: Beatmapset[], message: Message, decorator: any) => {
        const usergroup = parseUsergroup(user.data);
        let embed_description = "";

        function geneateEmbedDescription() {
            let size = 0;
            beatmaps.map((b) => {
                if (size < 10) {
                    size++;

                    // ? Use the emoji to get the data
                    if (decorator.emoji == "▶") {
                        return (embed_description = embed_description.concat(
                            `**${size}** • [${b.artist} - ${b.title}](https://osu.ppy.sh/s/${
                                b.id
                            }) | ${decorator.emoji} ${b.play_count.toLocaleString("en-US")} \n`
                        ));
                    } else {
                        return (embed_description = embed_description.concat(
                            `**${size}** • [${b.artist} - ${b.title}](https://osu.ppy.sh/s/${
                                b.id
                            }) | ${decorator.emoji} ${b.favourite_count.toLocaleString("en-US")} \n`
                        ));
                    }
                }
            });
        }

        geneateEmbedDescription(); // ? Generate the rank

        let e = new EmbedBuilder({
            thumbnail: {
                url: `https://a.ppy.sh/${user.data.id}`,
            },
            description: embed_description,
            author: {
                name: `${user.data.username} | ${decorator.title}`,
                url: `https://osu.ppy.sh/users/${user.data.id}`,
                iconURL: usergroup.icon ? usergroup.icon : undefined,
            },
        }).setColor(usergroup.colour);

        // ? Ooooh boi, send
        message.channel.send({
            embeds: [e],
        });
    },
    reply: (
        user: UserResponse,
        beatmaps: Beatmapset[],
        command: ChatInputCommandInteraction,
        decorator: any
    ) => {
        const usergroup = parseUsergroup(user.data);
        let embed_description = "";

        const totalMapped =
            user.data.ranked_and_approved_beatmapset_count +
            user.data.loved_beatmapset_count +
            user.data.pending_beatmapset_count +
            user.data.graveyard_beatmapset_count;

        function geneateEmbedDescription() {
            let size = 0;
            beatmaps.map((b) => {
                if (size < 10) {
                    size++;

                    // ? Use the emoji to get the data
                    if (decorator.emoji == "▶") {
                        return (embed_description = embed_description.concat(
                            `**${size}** • [${b.artist} - ${b.title}](https://osu.ppy.sh/s/${
                                b.id
                            }) | ${decorator.emoji} ${b.play_count.toLocaleString("en-US")} \n`
                        ));
                    } else if (decorator.emoji == "📈") {
                        return (embed_description = embed_description.concat(
                            `**${size}** • [${b.artist} - ${b.title}](https://osu.ppy.sh/s/${
                                b.id
                            }) | ${decorator.emoji} ${Math.round(
                                calculateScoreForBeatmapset(b, totalMapped)
                            )} MPP\n`
                        ));
                    } else {
                        return (embed_description = embed_description.concat(
                            `**${size}** • [${b.artist} - ${b.title}](https://osu.ppy.sh/s/${
                                b.id
                            }) | ${decorator.emoji} ${b.favourite_count.toLocaleString("en-US")} \n`
                        ));
                    }
                }
            });
        }

        geneateEmbedDescription(); // ? Generate the rank

        let e = new EmbedBuilder({
            thumbnail: {
                url: `https://a.ppy.sh/${user.data.id}`,
            },
            description: embed_description,
            author: {
                name: `${user.data.username} | ${decorator.title}`,
                url: `https://osu.ppy.sh/users/${user.data.id}`,
                iconURL: usergroup.icon ? usergroup.icon : undefined,
            },
        }).setColor(usergroup.colour);

        // ? Ooooh boi, send
        command.editReply({
            embeds: [e],
        });
    },
};
