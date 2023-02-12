import { EmbedBuilder } from "discord.js";
import colors from "../../constants/colors";

export default new EmbedBuilder({
    title: "Hmmm...",
    description: `This user is not a BN/NAT.`,
}).setColor(colors.orange);
