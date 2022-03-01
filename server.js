const express = require("express");
const server = express();
const { consoleCheck } = require("./utils/logger");

server.all("/", (req, res) => {
	res.send("Your bot is alive!");
});

function keepAlive() {
	server.listen(3000, () => {
		consoleCheck("server.js", "Server is Ready!");
	});
}

module.exports = keepAlive;
