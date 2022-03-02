import ping from "./misc/ping";
import beatmap from "./misc/beatmap";
import mapper from "./user/mapper";
import choose from "./fun/choose";
import yesno from "./fun/yesno";

const commands: any = {
	ping: ping,
	mapper: mapper,
	choose: choose,
	yesno: yesno,
};

export default commands;
