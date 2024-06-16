import axios from "axios";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { AttachmentBuilder, SlashCommandStringOption } from "discord.js";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import { CommandCategory } from "../../struct/commands/CommandCategory";

const burningtext = new SlashCommand()
    .setName("firetext")
    .setNameAliases(["burningtext"])
    .setDescription("Creates a :fire: text")
    .setCategory(CommandCategory.Fun)
    .addOptions(
        new SlashCommandStringOption()
            .setName("text")
            .setDescription("Content of the gif")
            .setRequired(true)
    );

burningtext.setExecutable(async (command) => {
    try {
        const text = command.options.getString("text", true);

        const request = await axios.post(
            `https://cooltext.com/PostChange?LogoID=4&Text=${text}&FontSize=70&Color1_color=%23FF0000&Integer1=15&Boolean1=on&Integer9=0&Integer13=on&Integer12=on&BackgroundColor_color=%23FFFFFF`,
            {
                withCredentials: true,
            }
        );

        const data = request.data as {
            logoId: 4;
            newId: number;
            renderLocation: string;
            isAnimated: true;
        };

        const gifData = await axios(data.renderLocation.replace("https://", "http://"), {
            responseType: "stream",
        });

        const attachment = new AttachmentBuilder(gifData.data, {
            name: "flame.gif",
        });

        return command.editReply({
            files: [attachment],
        });
    } catch (e) {
        console.error(e);
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "Something went wrong, either the API is down or you're trying to use non alphanumeric characters."
                ),
            ],
        });
    }
});

export default burningtext;
