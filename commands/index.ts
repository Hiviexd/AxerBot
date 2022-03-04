import ping from "./misc/ping";
import mapper from "./user/mapper";
import choose from "./fun/choose";
import yesno from "./fun/yesno";
import participant from "./moderation/participant";
import spectator from "./moderation/spectator";
import purge from "./moderation/purge";
import send from "./moderation/send";

const commands: any = {
	ping: ping,
	mapper: mapper,
	choose: choose,
	yesno: yesno,
	participant: participant,
	spectator: spectator,
	purge: purge,
	send: send,
};

export default commands;
