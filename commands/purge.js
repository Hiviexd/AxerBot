const { ownerId } = require('../config.json');

exports.run = async (bot, message, args) => {
    if ((!message.member.roles.cache.has('937645148563709962'))&&(!message.member.roles.cache.has('937644405706354708'))&&(message.author.id !== ownerId)){
        return message.channel.send(":x: You don't have the persimmions to use this command!");
    }
    var amount = parseInt(args[0]);

    if (!amount)
        return message.channel.send('Please specify the amount of messages you want me to delete');
    if (amount > 100 || amount < 1)
        return message.channel.send('Please select a number *between* 100 and 1');

    message.channel.bulkDelete(amount).catch((err) => {
        message.channel.send(
            ':x: Due to Discord Limitations, I cannot delete messages older than 14 days'
        );
    });

    let msg = await message.channel.send(`Deleted \`${amount}\` messages`);
    setTimeout(() => {
        msg.delete();
    }, 2000);
};

exports.help = {
    name: 'purge',
};
