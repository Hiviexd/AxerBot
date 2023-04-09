import UserNotFound from "../../responses/embeds/UserNotFound";
import osuApi from "../../modules/osu/fetcher/osuApi";
import UserNotMapper from "../../responses/embeds/UserNotMapper";
import MapperEmbed from "../../responses/osu/MapperEmbed";
import checkCommandPlayers from "../../helpers/osu/player/checkCommandPlayers";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { MapperCard } from "../../models/images/MapperCard";
import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
} from "discord.js";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";

const mapper = new SlashCommand(
    "mapper",
    "Displays mapper statistics of a user",
    "osu!",
    true,
    {
        syntax: "/mapper `<user>`",
        example:
            "/mapper `Hivie`\n /mapper <@341321481390784512>\n /mapper `HEAVENLY MOON`",
        note: "You won't need to specify your username if you set yourself up with this command:\n`/osuset user <username>`",
    }
);

mapper.builder.addStringOption((o) =>
    o.setName("username").setDescription("Mapper username")
);

mapper.setExecuteFunction(async (command) => {
    let { playerName, status } = await checkCommandPlayers(command);

    if (status != 200) return;

    const mapper = await osuApi.fetch.user(encodeURI(playerName));

    if (mapper.status != 200)
        return command.editReply({
            embeds: [UserNotFound],
        });

    const mapper_beatmaps = await osuApi.fetch.userBeatmaps(
        mapper.data.id.toString()
    );

    if (mapper_beatmaps.status != 200) return;

    if (mapper_beatmaps.data.sets.length < 1)
        return command.editReply({
            embeds: [UserNotMapper],
        });

    const image = new MapperCard(mapper.data.id, mapper_beatmaps);
    image
        .render()
        .then((image) => {
            if (!image) return;

            const att = new AttachmentBuilder(image);

            const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents(
                new ButtonBuilder()
                    .setLabel("Mapper Profile")
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://osu.ppy.sh/users/${mapper.data.id}`),
                new ButtonBuilder()
                    .setLabel("Latest Beatmap")
                    .setStyle(ButtonStyle.Link)
                    .setURL(
                        `https://osu.ppy.sh/beatmapsets/${mapper_beatmaps.data.last.id}`
                    )
            );

            command.editReply({
                files: [att],
                components: [buttons],
            });
        })
        .catch((e) => {
            console.error(e);
            command.editReply({
                embeds: [generateErrorEmbed("Something went wrong!")],
            });
        });
});

export default mapper;
