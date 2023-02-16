import createNewUser from "../../database/utils/createNewUser";
import * as database from "../../database";
import generateSuccessEmbed from "../../helpers/text/embeds/generateSuccessEmbed";
import { SlashCommand } from "../../models/commands/SlashCommand";

const osuset = new SlashCommand(
    ["osuset", "link"],
    "Link your osu! account",
    "osu!",
    true,
    {
        description: "Sets your credentials so the bot recognizes you.",
        syntax: "/osuset `<field>` `<value>`",
        example:
            "/osuset `user` `Hivie`\n /osuset `user` `HEAVENLY MOON`\n /osuset `embed` `mapper`\n /osuset `embed` `player`",
    }
);

osuset.builder
    .addStringOption((o) =>
        o
            .setName("username")
            .setDescription("Your osu! account username")
            .setRequired(true)
    )
    .addStringOption((o) =>
        o
            .setName("embed")
            .setDescription(
                "Which embed should I send when I detect your profile URL?"
            )
            .addChoices(
                {
                    name: "Player",
                    value: "player",
                },
                {
                    name: "Mapper",
                    value: "mapper",
                }
            )
            .setRequired(true)
    );

osuset.setExecuteFunction(async (command) => {
    let user = await database.users.findOne({ _id: command.user.id });

    if (user == null) await createNewUser(command.user);

    user = await database.users.findOne({ _id: command.user.id });

    if (!user) return command.editReply("Something is wrong... Try again.");

    const username = command.options.getString("username", true);
    const embed = command.options.getString("embed", true);

    user.osu.username = username;
    user.osu.embed = embed;

    await database.users.findByIdAndUpdate(user._id, user);

    command.editReply({
        embeds: [
            generateSuccessEmbed(
                `\`Username\`: ${user.osu.username}\n\`Embed\`: ${user.osu.embed}`
            ),
        ],
    });
});

export default osuset;
