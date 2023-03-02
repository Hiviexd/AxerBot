// ? General
import ping from "./general/ping";
import avatar from "./general/avatar";
import reminder from "./general/reminder";
import about from "./general/about";
import help from "./general/help";

// ? Fun
import yesno from "./fun/yesno";
import roll from "./fun/roll";
import revolver from "./fun/revolver";
import owoify from "./fun/owoify";
import pun from "./fun/pun";
import heardle from "./fun/heardle";
import minesweeper from "./fun/minesweeper";
import fact from "./fun/fact";
import coinflip from "./fun/coinflip";
import choose from "./fun/choose";
import rps from "./fun/rps";
import guesstheflag from "./fun/gtf";

// ? Management
import verificationCommand from "./management/verification";
import userlog from "./management/userLog";
import sendmessage from "./management/sendMessage";
import purge from "./management/purge";
import quotes from "./management/quotes";
import embeds from "./management/embeds";
import osutimestamps from "./management/osuTimestamps";
import editMessage from "./management/editMessage";
import logging from "./management/logging";
import setRoles from "./management/setRoles";

// ? osu!
import mapper from "./osu/mapper";
import osuset from "./osu/osuset";
import mapsetrank from "./osu/mapsetrank";
import player from "./osu/player";
import recent from "./osu/recent";
import mappertracker from "./osu/mappertracker";
//import chess from "./fun/chess";

// ? bnsite
import bntracker from "./BNsite/bntracker";
import bn from "./BNsite/bn";
import openbns from "./BNsite/openbns";
import map from "./osu/map";
import search from "./osu/search";

//? tools
import { resizebg } from "./tools/resizebg";
import spectro from "./tools/spectro";
import debloat from "./tools/debloat";
import addsilent from "./tools/addsilence";

export const AxerCommands = [
    // ? General
    help,
    heardle,
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
    //chess,

    // ? Management
    verificationCommand,
    userlog,
    sendmessage,
    purge,
    quotes,
    embeds,
    osutimestamps,
    editMessage,
    logging,
    setRoles,

    // ? osu!
    mappertracker,
    recent,
    osuset,
    player,
    mapsetrank,
    mapper,
    map,
    search,

    // ? bnsite
    bn,
    openbns,
    bntracker,

    // ? tools
    resizebg,
    spectro,
    debloat,
    addsilent,
];
