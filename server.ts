import * as dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
const server = express();
import { consoleCheck } from "./utils/core/logger";

server.all("/", (req: Request, res: Response) => {
	res.send("Your bot is alive!");
});

function keepAlive() {
	server.listen(process.env.PORT, () => {
		consoleCheck("server.ts", "Server is Ready!");
	});
}

export default keepAlive;
