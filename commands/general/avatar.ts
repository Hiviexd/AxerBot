import {
    Client,
    ChatInputCommandInteraction,
    Message,
    EmbedBuilder,
    User,
    SlashCommandUserOption,
    SlashCommandStringOption,
} from "discord.js";
import UserNotFound from "../../responses/embeds/UserNotFound";
import colors from "../../constants/colors";
import { SlashCommand } from "../../models/commands/SlashCommand";
import abbreviation from "../../helpers/text/abbreviation";
import osuApi from "../../modules/osu/fetcher/osuApi";
import { CommandCategory } from "../../struct/commands/CommandCategory";

const avatar = new SlashCommand()
    .setName("avatar")
    .setDescription("Displays the avatar of the mentioned user or the author.")
    .setCategory(CommandCategory.General)
    .setDMPermission(false)
    .setHelp({
        syntax: "/avatar user:<id | mention>",
        example: "/avatar\n /avatar @Hivie\n /avatar <userid>",
    })
    .addOptions(
        new SlashCommandUserOption().setName("user").setDescription("Get avatar by user"),
        new SlashCommandStringOption().setName("id").setDescription("Get avatar by user id"),
        new SlashCommandStringOption()
            .setName("osu_username")
            .setDescription("Get user's osu avatar")
    );

avatar.setExecutable(async (command) => {
    // ? prevent errors

    let user: User | undefined = undefined;
    const osuInput = command.options.getString("osu_username");
    const idInput = command.options.getString("id");
    const userInput = command.options.getUser("user");

    if (osuInput) return sendOsuAvatar();

    async function sendOsuAvatar() {
        if (!osuInput) return;

        const osuUser = await osuApi.fetch.user(osuInput);

        if (!osuUser || !osuUser.data || osuUser.status != 200)
            return command.editReply({ embeds: [UserNotFound] });

        const avatarEmbed = new EmbedBuilder()
            .setColor(colors.purple)
            .setTitle(`${abbreviation(osuInput)} osu! avatar`)
            .setImage(`https://a.ppy.sh/${osuUser.data.id}`)
            .setFooter({
                text: `Requested by ${command.user.tag}`,
                iconURL: command.user.displayAvatarURL({
                    extension: "png",
                }),
            });
        command.editReply({ embeds: [avatarEmbed] }).catch(console.error);
    }

    if (idInput) {
        try {
            user = await command.client.users.fetch(idInput);
        } catch (e) {
            return command.editReply({ embeds: [UserNotFound] });
        }
    }

    if (userInput) {
        try {
            user = await command.client.users.fetch(userInput);
        } catch (e) {
            return command.editReply({ embeds: [UserNotFound] });
        }
    }

    if (!user) {
        user = command.user;
    }

    const avatarEmbed = new EmbedBuilder()
        .setColor(colors.purple)
        .setTitle(`${user.tag}'s avatar`)
        .setImage(user.displayAvatarURL({ extension: "png" }))
        .setFooter({
            text: `Requested by ${command.user.tag}`,
            iconURL: command.user.displayAvatarURL({
                extension: "png",
            }),
        });
    command.editReply({ embeds: [avatarEmbed] }).catch(console.error);
});

export { avatar };
