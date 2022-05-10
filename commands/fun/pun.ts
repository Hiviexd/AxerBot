import { Client, Message } from "discord.js";
import axios from "axios";

export default {
	name: "pun",
	help: {
		description: "Get a random pun!",
		syntax: "{prefix}pun",

	},
	category: "fun",
	run: async (bot: Client, message: Message, args: string[]) => {
        const config = {
            headers: {
                "Accept": "application/json",
                "user-agent": "Axerbot",
            }
        };
        const url = "https://icanhazdadjoke.com/";

        try{
            const req = await axios.get(url, config);
            message.channel.send(req.data.joke);
        }catch(e){
            message.channel.send("A server-side error occured, try again later.");
        }
    },  
};


