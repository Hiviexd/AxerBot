import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Client,
    EmbedBuilder,
} from "discord.js";
import { tracks } from "../../database";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import qatApi from "../../helpers/qat/fetcher/qatApi";
import { QatUser } from "../../types/qat";
import getBNPreferences from "../../helpers/qat/getters/preferences/getBNPreferences";
import getEmoji from "../../helpers/text/getEmoji";
import colors from "../../constants/colors";

async function qatTracking(bot: Client) {
    const allTracks = await tracks.find({ type: "qat" });

    let storedData = JSON.parse(
        readFileSync(
            path.resolve(__dirname + "/../../cache/nominators.json"),
            "utf8"
        )
    );

    const liveData = await qatApi.fetch.allUsers();
    const differentData: QatUser[] = [];

    if (!storedData || storedData.length == 0)
        return writeFileSync(
            path.resolve(__dirname + "/../../cache/nominators.json"),
            JSON.stringify(liveData),
            "utf8"
        );

    // dickwads and people who don't want to be tracked go here
    const blacklistedBNs = [9487458, 10959501, 33599, 3558897];

    if (storedData.length != 0) {
        for (const user of liveData.data) {
            const storedDataIndex = storedData.findIndex(
                (u: QatUser) => u._id == user._id
            );

            if (
                storedData[storedDataIndex] &&
                storedData[storedDataIndex].requestStatus.includes("closed") !=
                    user.requestStatus.includes("closed")
            )
                differentData.push(user);
        }
    }

    for (const track of allTracks) {
        await mapBns(track);
    }

    async function mapBns(track: any) {
        let usersToSend: QatUser[] = [];

        async function checkModes(user: QatUser) {
            let allow = false;

            for (const mode of user.modes) {
                if (track.targets.modes.includes(mode)) allow = true;
            }

            return allow;
        }

        for (const user of differentData) {
            if (blacklistedBNs.includes(user.osuId)) continue;

            if (await checkModes(user)) {
                usersToSend.push(user);
            }
        }

        for (const user of usersToSend) {
            await sendUpdate(user, track);
        }
    }

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
            if (bn.requestStatus.includes("closed") && !track.targets.closed)
                return false;

            if (!bn.requestStatus.includes("closed") && !track.targets.open)
                return false;

            return true;
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

    writeFileSync(
        path.resolve(__dirname + "/../../cache/nominators.json"),
        JSON.stringify(liveData.data),
        "utf8"
    );
    setTimeout(async () => {
        await qatTracking(bot);
    }, 30000); // ? checks every 30 seconds

    return void {};
}

export default qatTracking;
