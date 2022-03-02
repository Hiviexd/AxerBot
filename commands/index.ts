import ping from "./misc/ping";
import mapper from "./user/mapper";
import choose from "./fun/choose";
import yesno from "./fun/yesno";
import participant from "./moderation/participant";

const commands: any = {
	ping: ping,
	mapper: mapper,
	choose: choose,
	yesno: yesno,
	participant: participant,
};

export default commands;
