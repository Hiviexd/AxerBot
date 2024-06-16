import qatApi from "../../helpers/qat/fetcher/qatApi";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import OpenBNsEmbed from "../../responses/qat/OpenBNsEmbed";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { CommandCategory } from "../../struct/commands/CommandCategory";
import { SlashCommandStringOption } from "discord.js";

const openbns = new SlashCommand()
    .setName("openbns")
    .setDescription("Displays a list of currently open BNs/NATs based on data from the BN website")
    .setCategory(CommandCategory.BNSite)
    .addOptions(
        new SlashCommandStringOption()
            .setName("gamemode")
            .setDescription("Filter by gamemode")
            .addChoices(
                {
                    name: "osu",
                    value: "osu",
                },
                {
                    name: "taiko",
                    value: "taiko",
                },
                {
                    name: "catch",
                    value: "catch",
                },
                {
                    name: "mania",
                    value: "mania",
                }
            )
    );

openbns.setExecutable(async (command) => {
    let gamemode: string | undefined = undefined;

    const gamemodeInput = command.options.getString("gamemode");

    if (gamemodeInput) {
        gamemode = gamemodeInput.toString();
    }

    const qatAllUsers = await qatApi.fetch.allUsers();

    if (qatAllUsers.status != 200)
        return command.editReply({
            embeds: [generateErrorEmbed("Failed to fetch all users from the BN website")],
        });

    OpenBNsEmbed.reply(qatAllUsers, gamemode, command);
});

export { openbns };
