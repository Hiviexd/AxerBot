const { consoleCheck } = require("../utils/logger");

module.exports = {
	name: "ready",
	once: true,
	execute(bot) {
		//Log Bot's username and the amount of servers its in to console
		consoleCheck(
			"Ready.js",
			`${bot.user.username} is online on ${bot.guilds.cache.size} servers!`
		);

		//Set the Presence of the bot user
		bot.user.setPresence({ activities: [{ name: "with your mother" }] });
	},
};
