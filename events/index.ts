import ready from "./ready";
import guildCreate from "./guildCreate";
import guildMemberAdd from "./guildMemberAdd";
import guildMemberRemove from "./guildMemberRemove";
import interactionCreate from "./interactionCreate";
import messageCreate from "./messageCreate";
import messageDelete from "./messageDelete";
import messageUpdate from "./messageUpdate";
import voiceStateUpdate from "./voiceStateUpdate";
import guildBanAdd from "./guildBanAdd";
import guildBanRemove from "./guildBanRemove";

export default [
    ready,
    guildCreate,
    guildMemberAdd,
    guildMemberRemove,
    messageCreate,
    messageDelete,
    messageUpdate,
    interactionCreate,
    voiceStateUpdate,
    guildBanAdd,
    guildBanRemove,
];
