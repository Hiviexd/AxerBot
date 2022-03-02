import express, { Request, Response } from "express";
const server = express();
import { consoleCheck } from "./utils/core/logger";

server.all("/", (req: Request, res: Response) => {
	res.send("Your bot is alive!");
});

function keepAlive() {
	server.listen(3000, () => {
		consoleCheck("server.ts", "Server is Ready!");
	});
}

export default keepAlive;
