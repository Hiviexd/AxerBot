import axios from "axios";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import colors from "../../constants/colors";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";

const burningtext = new SlashCommand(
    ["burningtext", "firetext"],
    "Creates a :fire: text",
    "Fun",
    true
);

burningtext.builder.addStringOption((o) =>
    o.setName("text").setDescription("Content of the gif").setRequired(true)
);

burningtext.setExecuteFunction(async (command) => {
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

        const gifData = await axios(
            data.renderLocation.replace("https://", "http://"),
            {
                responseType: "stream",
            }
        );

        const attachment = new AttachmentBuilder(gifData.data, {
            name: "flame.gif",
        });

        const embed = new EmbedBuilder()
            .setTitle("🔥 Your burning text is ready!")
            .setColor(colors.pink)
            .setImage("attachment://flame.gif")
            .setFooter({
                text: `Requested by ${command.user.tag}`,
                iconURL: command.user.avatarURL() || "",
            })
            .setTimestamp();

        return command.editReply({
            embeds: [embed],
            files: [attachment],
        });
    } catch (e) {
        console.error(e);
        return command.editReply({
            embeds: [generateErrorEmbed("Something went wrong!")],
        });
    }
});

export default burningtext;
