import { EmbedBuilder, SlashCommandStringOption } from "discord.js";

import colors from "../../../../constants/colors";
import osuApi from "../../../../modules/osu/fetcher/osuApi";
import generateErrorEmbedWithTitle from "../../../../helpers/text/embeds/generateErrorEmbedWithTitle";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import truncateString from "../../../../helpers/text/truncateString";

const checkArtistPermissionsBeatmap = new SlashCommandSubcommand()
    .setName("artistpermissions")
    .setDescription("Check if a beatmap complies with content usage permissions")
    .addOptions(
        new SlashCommandStringOption()
            .setName("link")
            .setDescription("The beatmap to check")
            .setRequired(true)
    );

checkArtistPermissionsBeatmap.setExecutable(async (command) => {
    const link = command.options.getString("link");

    if (!link) {
        return command.editReply({
            embeds: [
                generateErrorEmbedWithTitle(
                    "Invalid link",
                    "You need to provide a valid beatmap link to check."
                ),
            ],
        });
    }

    const beatmapsetId = link.split("/")[4].split("#")[0];

    const beatmapset = await osuApi.fetch.beatmapset(beatmapsetId);

    if (!beatmapset) {
        return command.editReply({
            embeds: [
                generateErrorEmbedWithTitle(
                    "Beatmap not found",
                    "The beatmap you are trying to check does not exist or could not be found."
                ),
            ],
        });
    }

    const artist = beatmapset.data.artist;
    const tags = beatmapset.data.tags;

    // get the wiki page Rules/Content_usage_permissions
    const wikiPage = await osuApi.fetch.wikiPage("en", "Rules/Content_usage_permissions");

    if (!wikiPage) {
        return command.editReply({
            embeds: [
                generateErrorEmbedWithTitle(
                    "Wiki page not found",
                    "The wiki page for content usage permissions could not be found. Let a bot developer know."
                ),
            ],
        });
    }

    // get table from markdown
    const markdown = wikiPage.data.markdown;

    // Extract the table content using a regular expression
    const tableRegex = /###\s*Artist permissions\s*([\s\S]*?)(?=###|$)/g;
    const match = tableRegex.exec(markdown);
    if (!match) {
        return command.editReply({
            embeds: [
                generateErrorEmbedWithTitle(
                    "Wiki page not found",
                    "The content usage permissions table could not be found in the page. Let a bot developer know."
                ),
            ],
        });
    }

    let tableContent = match[1];

    const artistPermissions = [];

    const linesToRemove =
        /\|\s*Artist\s*\|\s*\|\s*Status\s*\|\s*Notes\s*\|\n\|\s*:--\s*\|\s*:--\s*\|\s*:--\s*\|\s*:--\s*\|\n/g;
    tableContent = tableContent.replace(linesToRemove, "");

    for (let line of tableContent.trim().split("\n")) {
        let row = line
            .split("|")
            .map((cell) => cell)
            .filter((cell) => cell !== "");

        // only row arrays will have a length higher than 1
        if (row.length > 1) {
            artistPermissions.push({
                artist: parseArtist(row[1]),
                status: parseStatus(row[2]),
                notes: row[3].trim(),
                monstercat: row[2].includes("monstercat-gold"),
            });
        }
    }

    let lookupStatus = "";
    let artistInfo = null;

    // lookup artist via artist field
    // if artistInfo.artist.name is 1 word, split beatmap artist by space, else do a simple includes
    artistInfo = artistPermissions.find((artistInfo) =>
        !artistInfo.artist.name.includes(" ")
            ? artist.toLowerCase().split(" ").includes(artistInfo.artist.name.toLowerCase())
            : artist.toLowerCase().includes(artistInfo.artist.name.toLowerCase())
    );

    if (!artistInfo) {
        // lookup artist via tags
        artistInfo = artistPermissions.find((artistInfo) =>
            tags.split(" ").includes(artistInfo.artist.name.toLowerCase())
        );

        if (!artistInfo) {
            lookupStatus = "unknown";
        } else {
            lookupStatus = "foundInTags";
        }
    } else {
        lookupStatus = "foundInArtistField";
    }

    const title = `${
        lookupStatus === "unknown"
            ? getStatusDecorations("unknown").emoji
            : getStatusDecorations(artistInfo?.status as string).emoji
    } Artist Permissions`;

    const color =
        lookupStatus === "unknown"
            ? getStatusDecorations("unknown").color
            : getStatusDecorations(artistInfo?.status as string).color;

    let description =
        lookupStatus === "unknown"
            ? `Could not find artist **${artist}** in the content usage permissions table.`
            : `Found artist for the beatmap **[${artist} - ${beatmapset.data.title}](${link})** in [content usage permissions](https://osu.ppy.sh/wiki/en/Rules/Content_usage_permissions) article.`;

    if (lookupStatus === "foundInTags")
        description += `\n\nNote: The artist **${artistInfo?.artist.name}** was found in the **tags** of the beatmap.`;

    const monstercatNote =
        "This artist is licensed in cooperation with [Monstercat](https://osu.ppy.sh/beatmaps/artists/255), and users may be able to obtain external media usage rights via a [Monstercat Gold](https://www.monstercat.com/gold) subscription. Please consult their site for specific details on this licence.";
    let notes = artistInfo?.monstercat
        ? `${artistInfo?.notes}\n\n${monstercatNote}`
        : artistInfo?.notes;

    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .setFooter({ text: "Getting explicit permission from the artist always overrides this!" });

    if (lookupStatus !== "unknown")
        embed.addFields(
            {
                name: "Artist",
                value: artistInfo?.artist.id
                    ? `[${artistInfo?.artist.name}](https://osu.ppy.sh/beatmaps/artists/${artistInfo?.artist.id})`
                    : artistInfo?.artist.name || "Unknown",
                inline: true,
            },
            {
                name: "Status",
                value:
                    `${getStatusDecorations(artistInfo?.status as string).emoji} ${
                        getStatusDecorations(artistInfo?.status as string).string
                    }` || "Unknown",
                inline: true,
            },
            {
                name: "Notes",
                value: truncateString(notes || "*None*", 1024),
            }
        );

    return command.editReply({
        embeds: [embed],
    });
});

//? local helpers

/** trims and removes backslashes */
function sanitizeArtistName(name: string): string {
    return name.trim().replace(/\\/g, "");
}

/** if string is in the `[artist](link)` format, return `{ name: artist, id: number }`, else return `{ name: artist, id: null }` */
function parseArtist(artistString: string) {
    const artistRegex = /\[(.*?)\]\((.*?)\)/;
    const match = artistString.match(artistRegex);

    if (match) {
        const idMatch = match[2].match(/\d+/);
        const id = idMatch ? parseInt(idMatch[0]) : null;

        return {
            name: sanitizeArtistName(match[1]),
            id: id,
        };
    } else {
        return {
            name: sanitizeArtistName(artistString),
            id: null,
        };
    }
}

function parseStatus(statusString: string) {
    const statusRegex = /!?\[\]\[(.*?)\]/;
    const match = statusString.match(statusRegex);
    if (match) {
        return match[1];
    } else {
        return null;
    }
}

function getStatusDecorations(status: string) {
    switch (status) {
        case "true":
            return {
                emoji: "✅",
                color: colors.green,
                string: "Allowed",
            };
        case "partial":
            return {
                emoji: "🔶",
                color: colors.orange,
                string: "Allowed, with exceptions",
            };
        case "false":
            return {
                emoji: "❌",
                color: colors.red,
                string: "Not allowed",
            };
        default:
            return {
                emoji: "❔",
                color: colors.gray,
                string: "Unknown",
            };
    }
}

export { checkArtistPermissionsBeatmap };
