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
import { consoleCheck } from "../../helpers/core/logger";
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

            for (const track of allTracks) {
                sendUpdate(message.data.user, track);
            }
        } catch (e: any) {
            const statusManager = new StatusManager();
            statusManager.sendErrorMessage(
                `Can't send bn update: ${e.message}`
            );
            console.error(e);
        }
    });

    async function sendUpdate(bn: QatUser, track: any) {
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

        const texts: { [key: string]: any } = {
            open: {
                title: `🟢 Open (<t:${Math.trunc(
                    new Date().valueOf() / 1000
                )}:R>)`,
                thumbnail: {
                    url: `https://a.ppy.sh/${bn.osuId}`,
                },
                description: `**[${bn.username}](https://osu.ppy.sh/users/${bn.osuId})** ${modeIcons} is now **accepting** BN requests!\n Check out their preferences below:`,
                fields: [
                    {
                        name: "Positive",
                        value: getBNPreferences.positive(bn),
                        inline: true,
                    },
                    {
                        name: "Negative",
                        value: getBNPreferences.negative(bn),
                        inline: true,
                    },
                ],
                footer: footer,
            },
            closed: {
                title: `🔴 Closed (<t:${Math.trunc(
                    new Date().valueOf() / 1000
                )}:R>)`,
                thumbnail: {
                    url: `https://a.ppy.sh/${bn.osuId}`,
                },
                description: `**[${bn.username}](https://osu.ppy.sh/users/${bn.osuId})** ${modeIcons} is **no longer** accepting BN requests.`,
                footer: footer,
            },
        };

        const open = bn.requestStatus.includes("closed") ? false : true;

        const embed = new EmbedBuilder(
            texts[open ? "open" : "closed"]
        ).setColor(open ? colors.green : colors.red);

        const buttons = new ActionRowBuilder<ButtonBuilder>();
        const buttons2 = new ActionRowBuilder<ButtonBuilder>();

        if (!bn.requestStatus.includes("closed")) {
            const dmButton = new ButtonBuilder();
            dmButton
                .setStyle(ButtonStyle.Link)
                .setLabel("Send message (osu!)")
                .setURL(`https://osu.ppy.sh/home/messages/users/${bn.osuId}`);

            buttons.addComponents(dmButton);

            if (bn.requestStatus.includes("personalQueue") && bn.requestLink) {
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
                buttons2.addComponents(globalQueueButton);
            }
        }

        const guild = bot.guilds.cache.get(track.guild);

        if (!guild) return;

        const channel = guild.channels.cache.get(track.channel);

        // ! deletes trackers upon booting for some reason dont use
        // if (!channel) return tracks.findByIdAndDelete(track._id);

        if (!channel) return;

        function allowSend() {
            let v = false;

            if (bn.requestStatus.includes("closed") && !track.targets.closed)
                return !v;

            if (!bn.requestStatus.includes("closed") && !track.targets.open)
                return !v;

            track.targets.modes.forEach((mode: string) => {
                if (bn.modes.includes(mode)) v = true;
            });

            return v;
        }

        if (channel.isTextBased() && allowSend()) {
            if (!bn.requestStatus.includes("closed")) {
                return await channel
                    .send({
                        embeds: [embed],
                        components: bn.requestStatus.includes("globalQueue")
                            ? [buttons, buttons2]
                            : [buttons],
                    })
                    .catch((e) => {
                        console.error(e);
                    });
            } else {
                return await channel
                    .send({
                        embeds: [embed],
                    })
                    .catch((e) => {
                        console.error(e);
                    });
            }
        }

        return void {};
    }

    return void {};
}

export default qatTracking;
