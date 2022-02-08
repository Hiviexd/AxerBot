import { Client, TextChannel } from 'discord.js';
import dotenv from 'dotenv';
import { MessageHandler } from './MessageHandler';

class Main {
    private _client: Client;
    private _messageHandler: MessageHandler;

    constructor() {
        dotenv.config();

        this._client = new Client({
            intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES'],
        });

        this._messageHandler = new MessageHandler(this._client);
    }
}

const main = new Main();
