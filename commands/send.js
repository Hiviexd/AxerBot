const { ownerId } = require('../config.json');

exports.run = async (bot, message, args) => {
    if (
        !message.member.roles.cache.find((role) => role.name === 'Host' || role.name === 'Judge' || role.name === 'Owner' || role.name === 'Moderator') &&
        message.author.id !== ownerId
    ) {
        let msg = await message.channel.send(":x: You don't have the permission to use this command!");
        setTimeout(() => {
            msg.delete();
        }, 2000);
        return ;
    }

    lastArg = args[args.length - 1];
    args.pop();
    var toSay = args.join(' ');
    var destination = message.guild.channels.cache.find((channel) => channel.name === lastArg);

    if (!toSay){
        let msg = await message.channel.send(':exclamation: Please specify the message you want to send.');
        setTimeout(() => {
            msg.delete();
        }, 2000);
        return ;
    } 

    if (!destination){
        let msg = await message.channel.send(':exclamation: Please specify a valid channel.');
        setTimeout(() => {
            msg.delete();
        }, 2000);
        return ;
    }

    message.guild.channels.cache
        .get(destination.id)
        .send(toSay)
        .catch((err) => {
            message.channel.send(':x: Error sending message.');
        });

    let msg = await message.channel.send(`:white_check_mark: Message sent!`);
    setTimeout(() => {
        msg.delete();
    }, 2000);
};

exports.help = {
    name: 'send',
};
