import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
} from "discord.js";
import getTop3Genres from "../../helpers/qat/getters/genres/getTop3Genres";
import getTop3Languages from "../../helpers/qat/getters/languages/getTop3Languages";
import getTop3Mappers from "../../helpers/qat/getters/mappers/getTop3Mappers";
import getUniqueMappersNumber from "../../helpers/qat/getters/mappers/getUniqueMappersNumber";
import getRequestStatus from "../../helpers/qat/getters/requestStatus/getRequestStatus";
import parseResets from "../../helpers/qat/getters/resets/parseResets";
import abbreviation from "../../helpers/text/abbreviation";
import calculateDuration from "../../helpers/text/calculateDuration";
import getEmoji from "../../helpers/text/getEmoji";
import parseUsergroup from "../../modules/osu/player/getHighestUsergroup";
import { QatUserResponse, UserActivityResponse } from "../../types/qat";
import { UserResponse } from "../../types/user";
import truncateString from "../../helpers/text/truncateString";

/**
 * empty embed field
{
	// https://stackoverflow.com/a/66487097/16164887
	name: "\u200b",
	value: "\u200b",
	nline: true,
},
*/

export default {
    reply: async (
        osuUser: UserResponse,
        qatUser: QatUserResponse,
        activity: UserActivityResponse,
        command: ChatInputCommandInteraction
    ) => {
        // get highest usergroup
        const usergroup = parseUsergroup(osuUser.data);

        const latestNom =
            activity.data.uniqueNominations[activity.data.uniqueNominations.length - 1];

        const userRules = qatUser.data.requestInfo;

        const rulesButton = new ButtonBuilder()
            .setLabel("Request Info")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(`bnrules,${osuUser.data.id}`);

        let reqStatus = "";
        if (qatUser.data.requestStatus.length > 0) {
            if (qatUser.data.requestStatus.includes("closed")) {
                reqStatus = "🔴 Closed";
            } else {
                reqStatus = `🟢 Open (${getRequestStatus(qatUser.data)})`;
            }
        } else {
            reqStatus = "⚪ Unknown";
        }

        const modeIcons = qatUser.data.modes
            .map((mode: string) => {
                return `${getEmoji(mode as keyof typeof getEmoji)} `;
            })
            .join("")
            .trim();

        let e = new EmbedBuilder()
            .setAuthor({
                name: `${osuUser.data.username} • BN${qatUser.data.natDuration ? "/NAT" : ""} info`,
                url: `https://osu.ppy.sh/users/${osuUser.data.id}`,
                iconURL: usergroup.icon ? usergroup.icon : undefined,
            })
            .setThumbnail(osuUser.data.avatar_url)
            .setColor(usergroup.colour)
            .setDescription(
                `showing **[${abbreviation(
                    osuUser.data.username
                )}](https://bn.mappersguild.com/users?id=${
                    qatUser.data.id
                })** ${modeIcons} BN website info from the last **90** days.`
            )
            .addFields(
                {
                    name: "Request Status",
                    value: `${reqStatus}`,
                    inline: true,
                },
                {
                    name: `BN${qatUser.data.natDuration ? "/NAT" : ""} for`,
                    value: `${
                        qatUser.data.natDuration
                            ? `🟠 ${calculateDuration(qatUser.data.natDuration)}\n`
                            : ""
                    }🟣 ${calculateDuration(qatUser.data.bnDuration)}`,
                    inline: true,
                }
            );

        e.addFields(
            {
                name: "Mappers",
                // sorry for whoever has to read this idk
                value: `🗺️ ${getUniqueMappersNumber(activity).toString()} ${
                    getUniqueMappersNumber(activity)
                        ? `(${Math.floor(
                              (getUniqueMappersNumber(activity) /
                                  activity.data.uniqueNominations.length) *
                                  100
                          )}%)`
                        : ""
                }`,
                inline: true,
            },
            {
                name: "Nominations",
                value: `💭 ${activity.data.uniqueNominations.length} (90d)
                💭 ${Math.max(osuUser.data.nominated_beatmapset_count, activity.data.uniqueNominations.length)} (all)`,
                inline: true,
            },
            {
                name: "Resets Received",
                value: `${parseResets(
                    activity.data.nominationsDisqualified,
                    activity.data.nominationsPopped
                )}`,
                inline: true,
            },
            {
                name: "Resets Given",
                value: `${parseResets(activity.data.disqualifications, activity.data.pops)}`,
                inline: true,
            },
            {
                name: "Top Mappers",
                value: `${getTop3Mappers(activity).toString()}`,
                inline: true,
            },
            {
                name: "Top Genres",
                value: `${getTop3Genres(activity).toString()}`,
                inline: true,
            },
            {
                name: "Top Languages",
                value: `${getTop3Languages(activity).toString()}`,
                inline: true,
            }
        );

        if (latestNom) {
            e.addFields({
                name: "Latest Nomination",
                value: `[${latestNom.artistTitle}](https://osu.ppy.sh/beatmapsets/${latestNom.beatmapsetId})`,
                inline: true,
            }).setImage(
                `https://assets.ppy.sh/beatmaps/${latestNom.beatmapsetId}/covers/cover.jpg`
            );

            // only load footer when there's a nom message
            if (latestNom.content) {
                let nomMessage = latestNom.content;

                // sanitize nom message
                // step 1: change consecutive newlines to single newline
                nomMessage = nomMessage.replace(/\n+/g, "\n");

                // step 2: change newlines to spaces
                nomMessage = nomMessage.replace(/\r?\n|\r/g, " ");

                // step 3: replace [text](link) with the text portion only
                nomMessage = nomMessage.replace(/\[([^\]]+)\]\(https?:\/\/[^\s]+\)/g, "$1");

                // step 4: replace ![](link) with "(image)"
                nomMessage = nomMessage.replace(/!\[\]\(https?:\/\/[^\s]+\)/g, "(image)");

                // step 5: truncate
                nomMessage = truncateString(nomMessage, 60, true);

                e.setFooter({
                    text: `${osuUser.data.username} "${nomMessage}"`,
                    iconURL: osuUser.data.avatar_url,
                });
            }
        }

        command.editReply({
            embeds: [e],
            components: userRules
                ? [new ActionRowBuilder<ButtonBuilder>().setComponents(rulesButton)]
                : [],
        });
    },
};
