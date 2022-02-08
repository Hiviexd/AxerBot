import { Client, Message } from 'discord.js';

export class MessageHandler {
    private readonly _PREFIX = '!';

    private _client: Client;

    constructor(client: Client) {
        this._client = client;

        this.initializeCommands();
    }

    private initializeCommands(): void {
        this._client.on('message', (message) => {
            const content = message.content;

            if (!content.startsWith(this._PREFIX)) {
                return;
            }

            const split = content.split(' ');

            const command = split[0];
            const args = split.slice(1);

            this.initializePingCommand(command, message);
        });
    }

    private initializePingCommand(command: string, message: Message<boolean>) {
        if (command === 'ping') {
            message.channel.send('Pong!');
        }
    }
}
