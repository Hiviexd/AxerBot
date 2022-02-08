import DiscordJS, { Message, TextChannel } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const client = new DiscordJS.Client({
    intents: [
        'GUILDS',
        'GUILD_MESSAGES',
        'GUILD_MEMBERS',
    ]
})

//bot init
client.on('ready', () => {
    console.log('Ready!');
})

//welcome message
client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === 'arrival');
    if (!channel) return;
    (<TextChannel>channel).send(`Hello ${member}, please link your osu! profile, tell us whether you want the Participant or Spectator role, and tell us your favorite FA in order to get access to the channels!`);
})

//basic reply
client.on("messageCreate", (message) => {
    //pick a random date between 2 dates
    function randomDate(start: Date, end: Date) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }
    if (message.content.includes("axer") === true) {
        //message.channel.send('CHILDREN!!!!1!!');
        message.channel.send((<Message>message).(<Number>createdTimestamp)(randomDate(new Date(2020, 0, 1), TextChannel.lastMessage.createdTimestamp())));
    }
})

client.login(process.env.TOKEN);
