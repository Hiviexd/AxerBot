import createNewUser from "../../database/utils/createNewUser";
import * as database from "../../database";
import generateSuccessEmbed from "../../helpers/text/embeds/generateSuccessEmbed";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { CommandCategory } from "../../struct/commands/CommandCategory";
import { SlashCommandStringOption } from "discord.js";

const osuset = new SlashCommand()
    .setName("osuset")
    .setNameAliases(["linkprofile"])
    .setDescription("Connect your osu! account")
    .setCategory(CommandCategory.Osu)
    .setHelp({
        syntax: "/osuset username:Profile_Username embed:<Player|Mapper>",
        example: "/osuset `username:Sebola embed:player`",
    })
    .addOptions(
        new SlashCommandStringOption()
            .setName("username")
            .setDescription("Your osu! account username")
            .setRequired(true),
        new SlashCommandStringOption()
            .setName("embed")
            .setDescription("Which embed should I send when I detect your profile URL?")
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

osuset.setExecutable(async (command) => {
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

export { osuset };
