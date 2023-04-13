import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Client,
    EmbedBuilder,
} from "discord.js";
import { tracks } from "../../database";
import { QatUser } from "../../types/qat";
import getBNPreferences from "../../helpers/qat/getters/preferences/getBNPreferences";
import getEmoji from "../../helpers/text/getEmoji";
import colors from "../../constants/colors";
import WebSocket from "ws";
import { consoleCheck, consoleLog } from "../../helpers/core/logger";
import { StatusManager } from "../status/StatusManager";

async function qatTracking(bot: Client) {
    const websocketConfig = {
        headers: {
            username: process.env.QAT_USER,
            secret: process.env.QAT_SECRET,
            tags: "users:request_status_update",
        },
    };
    let qatWebsocket = new WebSocket(
        "wss://bn.mappersguild.com/websocket/interOp",
        websocketConfig
    );

    qatWebsocket.on("open", () => {
        consoleCheck("QatTracking", "Connected to bnsite via websocket");
    });

    qatWebsocket.on("close", () => {
        qatWebsocket = new WebSocket(
            "wss://bn.mappersguild.com/websocket/interOp",
            websocketConfig
        );
    });

    qatWebsocket.on("message", async (data: Buffer) => {
        try {
            const allTracks = await tracks.find({ type: "qat" });

            const message = JSON.parse(data.toString()) as {
                type: string;
                data: {
                    isOpen: boolean;
                    user: QatUser;
                };
            };

            consoleLog(
                "qatTracker",
                `Received status update from ${message.data.user.username}`
            );

            for (const track of allTracks) {
                sendUpdate(message.data.user, track, message.data.isOpen);
            }
        } catch (e: any) {
            const statusManager = new StatusManager();
            statusManager.sendErrorMessage(
                `Can't send bn update: ${e.message}`
            );
            console.error(e);
        }
    });

    async function sendUpdate(bn: QatUser, track: any, isOpen: boolean) {
        const footer = {
            text: "BN website",
            iconURL: "https://bn.mappersguild.com/images/qatlogo.png",
        };
        const modeIcons = bn.modes
            .map((mode: string) => {
                return `${getEmoji(mode as keyof typeof getEmoji)} `;
            })
            .join("")
            .trim();

        const texts: { [key: string]: EmbedBuilder } = {
            open: new EmbedBuilder()
                .setTitle(
                    `🟢 Open (<t:${Math.trunc(new Date().valueOf() / 1000)}:R>)`
                )
                .setDescription(
                    `**[${bn.username}](https://osu.ppy.sh/users/${bn.osuId})** ${modeIcons} is now **accepting** BN requests!\n Check out their preferences below:`
                )
                .setThumbnail(`https://a.ppy.sh/${bn.osuId}`)
                .setFooter(footer)
                .setFields(
                    {
                        name: "Positive",
                        value: getBNPreferences.positive(bn),
                        inline: true,
                    },
                    {
                        name: "Negative",
                        value: getBNPreferences.negative(bn),
                        inline: true,
                    }
                )
                .setColor(colors.green),
            closed: new EmbedBuilder()
                .setTitle(
                    `🔴 Closed (<t:${Math.trunc(
                        new Date().valueOf() / 1000
                    )}:R>)`
                )
                .setDescription(
                    `**[${bn.username}](https://osu.ppy.sh/users/${bn.osuId})** ${modeIcons} is **no longer** accepting BN requests.`
                )
                .setThumbnail(`https://a.ppy.sh/${bn.osuId}`)
                .setFooter(footer)
                .setColor(colors.red),
        };

        const buttons = new ActionRowBuilder<ButtonBuilder>();

        const embed = texts[isOpen ? "open" : "closed"];

        if (isOpen) {
            const dmButton = new ButtonBuilder();
            dmButton
                .setStyle(ButtonStyle.Link)
                .setLabel("Send message (osu!)")
                .setURL(`https://osu.ppy.sh/home/messages/users/${bn.osuId}`);
            buttons.addComponents(dmButton);

            if (bn.requestStatus.includes("personalQueue") && bn.requestLink) {
                console.log(bn.requestLink);
                const siteName = new URL(bn.requestLink).hostname.split(".")[0];
                const personalQueueButton = new ButtonBuilder();
                personalQueueButton
                    .setStyle(ButtonStyle.Link)
                    .setLabel(`Personal queue (${siteName})`)
                    .setURL(bn.requestLink);
                buttons.addComponents(personalQueueButton);
            }

            if (bn.requestStatus.includes("globalQueue")) {
                const globalQueueButton = new ButtonBuilder();
                globalQueueButton
                    .setStyle(ButtonStyle.Link)
                    .setLabel(`Global queue`)
                    .setURL(`https://bn.mappersguild.com/modrequests`);
                buttons.addComponents(globalQueueButton);
            }
        }

        const guild = bot.guilds.cache.get(track.guild);

        if (!guild) return;

        const channel = guild.channels.cache.get(track.channel);

        // ! deletes trackers upon booting for some reason dont use
        // if (!channel) return tracks.findByIdAndDelete(track._id);

        if (!channel) return;

        function allowSend() {
            let hasTarget = false;
            let hasModes = false;

            track.targets.modes.forEach((mode: string) => {
                if (bn.modes.includes(mode)) hasModes = true;
            });

            if (
                (isOpen && track.targets.open) ||
                (!isOpen && track.targets.closed)
            )
                hasTarget = true;

            if (!hasTarget || !hasModes) return false;

            return true;
        }

        if (allowSend()) {
            if (channel.isTextBased()) {
                return channel
                    .send({
                        embeds: [embed],
                        components: isOpen ? [buttons] : [],
                    })
                    .catch((e) => {
                        console.error(e);
                    });
            } else {
                return;
            }
        }

        return void {};
    }

    return void {};
}

export default qatTracking;
