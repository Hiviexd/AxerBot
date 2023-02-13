import UserNotFound from "../../responses/embeds/UserNotFound";
import osuApi from "../../helpers/osu/fetcher/osuApi";
import UserNotMapper from "../../responses/embeds/UserNotMapper";
import MapperEmbed from "../../responses/osu/MapperEmbed";
import checkCommandPlayers from "../../helpers/osu/player/checkCommandPlayers";
import { SlashCommand } from "../../models/commands/SlashCommand";

const mapper = new SlashCommand(
    "mapper",
    "Displays mapper statistics of a user",
    "osu!",
    false,
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

    MapperEmbed.reply(mapper, mapper_beatmaps, command);
});

export default mapper;
