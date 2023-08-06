import { ApplicationCommandType } from "discord.js";
import { users } from "../../../database";
import abbreviation from "../../../helpers/text/abbreviation";
import generateErrorEmbed from "../../../helpers/text/embeds/generateErrorEmbed";
import { ContextMenuCommand, ContextMenuType } from "../../../models/commands/ContextMenuCommand";
import PlayerEmbed from "../../../responses/osu/PlayerEmbed";
import osuApi from "../../../modules/osu/fetcher/osuApi";

export default new ContextMenuCommand<ContextMenuType.Message>()
    .setName("View osu! profile")
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

            PlayerEmbed.reply(player, command);
        } catch (e) {
            command.editReply({
                embeds: [generateErrorEmbed("Something went wrong...")],
            });
        }
    });
