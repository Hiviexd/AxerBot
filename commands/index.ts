import ping from "./misc/ping";
import mapper from "./user/mapper";
import choose from "./fun/choose";
import yesno from "./fun/yesno";
import participant from "./moderation/participant";
import spectator from "./moderation/spectator";
import purge from "./moderation/purge";
import send from "./moderation/send";
import osuset from "./user/osuset";
import mapsetrank from "./user/mapsetrank";
import help from "./misc/help";
import setprefix from "./moderation/setprefix";

const commands: any = {
	ping: ping,
	mapper: mapper,
	choose: choose,
	yesno: yesno,
	participant: participant,
	spectator: spectator,
	purge: purge,
	send: send,
	osuset: osuset,
	mapsetrank: mapsetrank,
	help: help,
	setprefix: setprefix,
};

export default commands;
