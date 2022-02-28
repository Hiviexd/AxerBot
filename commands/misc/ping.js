exports.run = async (bot, message) => {
	message.channel.send("`" + bot.ws.ping + " ms`");
};

exports.help = {
	name: "ping",
};
