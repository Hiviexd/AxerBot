import { SlashCommand } from "../../models/commands/SlashCommand";
import searchBeatmap from "./subcommands/search/searchBeatmap";

const search = new SlashCommand("search", "Search beatmaps", "osu!", true);

search.addSubcommand(searchBeatmap);

export default search;
