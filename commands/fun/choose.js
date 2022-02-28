exports.run = async (bot, message, args) => {
	if (args.length < 1) {
		message.channel.send("what am i supposed to choose from wtf");
		return;
	} else if (args.length == 1) {
		message.channel.send(`and? what's the other choice??`);
		return;
	}
	let choices = args.filter((choice) => choice.length > 0 && choice !== "or");
	let randomChoice = choices[Math.floor(Math.random() * choices.length)];
	message.channel.send(randomChoice);
};

exports.help = {
	name: "choose",
};
