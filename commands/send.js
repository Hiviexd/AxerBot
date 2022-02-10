const { ownerId } = require('../config.json');

exports.run = async (bot, message, args) => {
    console.log(args);
    if (
        !message.member.roles.cache.find((role) => role.name === 'Host' || role.name === 'Judge') &&
        message.author.id !== ownerId
    ) {
        return message.channel.send(":x: You don't have the persimmions to use this command!");
    }
    var toSay = args[0];
    var destination = message.guild.channels.cache.find((channel) => channel.name === args[1]);

    if (!toSay) return message.channel.send('Please specify the message you want to send');
    if (!destination)
        return message.channel.send('Please specify the channel you want to send the message to');

    message.guild.channels.cache
        .get(destination.id)
        .send(toSay)
        .catch((err) => {
            message.channel.send(':x: Error sending message');
        });

    let msg = await message.channel.send(`Message sent!`);
    setTimeout(() => {
        msg.delete();
    }, 2000);
};

exports.help = {
    name: 'send',
};
