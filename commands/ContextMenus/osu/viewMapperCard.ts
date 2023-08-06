import {
    ActionRowBuilder,
    ApplicationCommandType,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
} from "discord.js";
import { users } from "../../../database";
import abbreviation from "../../../helpers/text/abbreviation";
import generateErrorEmbed from "../../../helpers/text/embeds/generateErrorEmbed";
import { ContextMenuCommand, ContextMenuType } from "../../../models/commands/ContextMenuCommand";
import PlayerEmbed from "../../../responses/osu/PlayerEmbed";
import osuApi from "../../../modules/osu/fetcher/osuApi";
import { MapperCard } from "../../../models/images/MapperCard";
import UserNotFound from "../../../responses/embeds/UserNotFound";
import UserNotMapper from "../../../responses/embeds/UserNotMapper";

export default new ContextMenuCommand<ContextMenuType.Message>()
    .setName("View osu! mapper card")
    .setType(ApplicationCommandType.Message)
    .setEphemeral(true)
    .setModal(false)
    .setExecuteFunction(async (command) => {
        try {
            const targetUser = command.targetMessage.author;

            const userDb = await users.findById(targetUser.id);

            if (!userDb || !userDb.verified_id)
                return command.editReply({
                    embeds: [generateErrorEmbed("This user didn't set his profile!")],
                });

            const player = await osuApi.fetch.user(userDb.verified_id.toString());

            if (!player.data || player.status != 200)
                return command.editReply(
                    `[${abbreviation(targetUser.username)} profile](https://osu.ppy.sh/users/${
                        userDb.verified_id
                    })`
                );

            const beatmaps = await osuApi.fetch.userBeatmaps(player.data.id);

            if (beatmaps.status != 200)
                return command.editReply({
                    embeds: [UserNotFound],
                });

            const totalMapped =
                player.data.ranked_and_approved_beatmapset_count +
                player.data.loved_beatmapset_count +
                player.data.pending_beatmapset_count +
                player.data.graveyard_beatmapset_count;

            if (totalMapped < 1)
                return command.editReply({
                    embeds: [UserNotMapper],
                });

            const image = new MapperCard(player.data, beatmaps);

            image
                .render()
                .then((image) => {
                    if (!image) return;

                    const att = new AttachmentBuilder(image);

                    const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents(
                        new ButtonBuilder()
                            .setLabel("Mapper Profile")
                            .setStyle(ButtonStyle.Link)
                            .setURL(`https://osu.ppy.sh/users/${player.data.id}`)
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
        } catch (e) {
            command.editReply({
                embeds: [generateErrorEmbed("Something went wrong...")],
            });
        }
    });
