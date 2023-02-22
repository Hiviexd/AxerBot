import qatApi from "../../helpers/qat/fetcher/qatApi";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import OpenBNsEmbed from "../../responses/qat/OpenBNsEmbed";
import { SlashCommand } from "../../models/commands/SlashCommand";

const openbns = new SlashCommand(
    "openbns",
    "Displays a list of currently open BNs/NATs based on data from the BN website",
    "BN website",
    true
);

openbns.builder.addStringOption((o) =>
    o.setName("gamemode").setDescription("Filter by gamemode").addChoices(
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

openbns.setExecuteFunction(async (command) => {
    // ? prevent errors

    let gamemode: string | undefined = undefined;

    const gamemodeInput = command.options.getString("gamemode");

    if (gamemodeInput) {
        gamemode = gamemodeInput.toString();
    }

    const qatAllUsers = await qatApi.fetch.allUsers();

    if (qatAllUsers.status != 200)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "Failed to fetch all users from the BN website"
                ),
            ],
        });

    OpenBNsEmbed.reply(qatAllUsers, gamemode, command);
});

export default openbns;
