import { AttachmentBuilder } from "discord.js";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { TaikoPattern } from "../../models/images/TaikoPattern";

const taikopattern = new SlashCommand(
    "taikopattern",
    "Generate an image of a taiko pattern",
    "Tools",
    true
);

taikopattern.builder.addStringOption((o) =>
    o.setName("pattern").setDescription("Pattern string").setRequired(true)
);

taikopattern.setExecuteFunction(async (command) => {
    const pattern = command.options.getString("pattern", true);

    const patternObject = new TaikoPattern(pattern);
    const image = await patternObject.render();

    const att = new AttachmentBuilder(image, {
        name: "pattern.png",
    });

    return command.editReply({
        files: [att],
    });
});

export default taikopattern;
