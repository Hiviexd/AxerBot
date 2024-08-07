import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandStringOption,
} from "discord.js";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { MapperCard } from "../../models/images/MapperCard";
import osuApi from "../../modules/osu/fetcher/osuApi";
import checkCommandPlayers from "../../modules/osu/player/checkCommandPlayers";
import UserNotFound from "../../responses/embeds/UserNotFound";
import UserNotMapper from "../../responses/embeds/UserNotMapper";
import { CommandCategory } from "../../struct/commands/CommandCategory";

const mapper = new SlashCommand()
    .setName("mapper")
    .setNameAliases("card")
    .setDescription("Generate a card including mapping statistics of an user")
    .setCategory(CommandCategory.Osu)
    .setDMPermission(true)
    .addOptions(
        new SlashCommandStringOption().setName("username").setDescription("Mapper username")
    );

mapper.setExecutable(async (command) => {
    let { playerName, status } = await checkCommandPlayers(command);

    if (status != 200) return;

    const mapper = await osuApi.fetch.user(encodeURI(playerName));

    if (mapper.status != 200)
        return command.editReply({
            embeds: [UserNotFound],
        });

    const beatmaps = await osuApi.fetch.userBeatmaps(mapper.data.id);

    if (beatmaps.status != 200)
        return command.editReply({
            embeds: [UserNotFound],
        });

    const totalMapped =
        mapper.data.ranked_and_approved_beatmapset_count +
        mapper.data.loved_beatmapset_count +
        mapper.data.pending_beatmapset_count +
        mapper.data.graveyard_beatmapset_count;

    if (totalMapped < 1)
        return command.editReply({
            embeds: [UserNotMapper],
        });

    const image = new MapperCard(mapper.data, beatmaps);

    image
        .render()
        .then((image) => {
            if (!image) return;

            const att = new AttachmentBuilder(image);

            const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents(
                new ButtonBuilder()
                    .setLabel("Mapper Profile")
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://osu.ppy.sh/users/${mapper.data.id}`)
                // new ButtonBuilder()
                //     .setLabel("Latest Beatmap")
                //     .setStyle(ButtonStyle.Link)
                //     .setURL(`https://osu.ppy.sh/beatmapsets/${mapper_beatmaps.data.last.id}`)
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

export { mapper };
