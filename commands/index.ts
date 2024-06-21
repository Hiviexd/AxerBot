// ? General
import { ping } from "./general/ping";
import { avatar } from "./general/avatar";
import { reminder } from "./general/reminder";
import { about } from "./general/about";
import { help } from "./general/help";

// ? Fun
import { yesno } from "./fun/yesno";
import { roll } from "./fun/roll";
import { revolver } from "./fun/revolver";
import { owoify } from "./fun/owoify";
import { pun } from "./fun/pun";
import { minesweeper } from "./fun/minesweeper";
import { fact } from "./fun/fact";
import { coinflip } from "./fun/coinflip";
import { choose } from "./fun/choose";
import { rps } from "./fun/rps";
import { speechbubble } from "./fun/speechbubble";
import { guesstheflag } from "./fun/gtf";

// ? Management
import { verificationCommand } from "./management/verification";
import { userlog } from "./management/userLog";
import { purge } from "./management/purge";
import { embeds } from "./management/embeds";
import { osutimestamps } from "./management/osuTimestamps";
import { logging } from "./management/logging";
import setRoles from "./management/setRoles";
import { selectroles } from "./management/selectroles";
import { report } from "./management/report";
import { silence } from "./management/silence";

// ? osu!
import { mapper } from "./osu/mapper";
import { osuset } from "./osu/osuset";
import { mapsetrank } from "./osu/mapsetrank";
import { player } from "./osu/player";
import { mapperTracker } from "./osu/mappertracker";
import burningtext from "./fun/burningtext";
import { beatmap } from "./osu/beatmap";

// ? bnsite
import { bntracker } from "./BNsite/bntracker";
import { bn } from "./BNsite/bn";
import { openbns } from "./BNsite/openbns";

//? tools
import { resizebg } from "./tools/resizebg";
import { spectrogram } from "./tools/spectro";
import { debloat } from "./tools/debloat";
import { addsilent } from "./tools/addsilence";
import { imagecolors } from "./tools/imagecolors";

// ? dev
import shutdown from "./dev/shutdown";

// ? Typedef
import { SlashCommand } from "../models/commands/SlashCommand";

export const AxerCommands = [
    // ? General
    help,
    ping,
    avatar,
    about,
    reminder,

    // ? Fun
    yesno,
    roll,
    revolver,
    pun,
    owoify,
    minesweeper,
    fact,
    coinflip,
    choose,
    rps,
    guesstheflag,
    burningtext,
    speechbubble,
    //chess,

    // ? Management
    verificationCommand,
    userlog,
    purge,
    embeds,
    osutimestamps,
    logging,
    setRoles,
    selectroles,
    report,
    silence,

    // ? osu!
    mapperTracker,
    osuset,
    player,
    mapsetrank,
    mapper,
    beatmap,

    // ? bnsite
    bn,
    openbns,
    bntracker,

    // ? tools
    resizebg,
    spectrogram,
    debloat,
    addsilent,
    imagecolors,

    // ? Dev
    shutdown,
] as SlashCommand[];
