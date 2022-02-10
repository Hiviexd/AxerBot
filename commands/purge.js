const { ownerId } = require('../config.json');

exports.run = async (bot, message, args) => {
    //if ((!message.member.roles.cache.has('937645148563709962'))&&(!message.member.roles.cache.has('937644405706354708'))&&(message.author.id !== ownerId)){
    let whitelist = ['Owner', 'Host', 'Judge', 'Moderator', 'Mod'];
    if ((!whitelist.includes(message.member.roles.cache))&&
    (message.author.id !== ownerId)){
        
        let msg = await message.channel.send(":x: You don't have the permission to use this command!");
        setTimeout(() => {
            msg.delete();
        }, 2000);
        return ;
    }

    var amount = parseInt(args[0]);

    if (!amount){
        let msg = await message.channel.send(":exclamation: Please specify the amount of messages you want me to delete.");
        setTimeout(() => {
            msg.delete();
        }, 2000);
        return ;
    }

    if (amount > 100 || amount < 1){
        let msg = await message.channel.send(":exclamation: Please specify an amount between 1 and 100.");
        setTimeout(() => {
            msg.delete();
        }, 2000);
        return ;
    }


    message.channel.bulkDelete(amount).catch((err) => {
        message.channel.send(
            ':x: Due to Discord Limitations, I cannot delete messages older than 14 days.'
        );
    });

    let msg = await message.channel.send(`:white_check_mark: Deleted \`${amount}\` messages!`);
    setTimeout(() => {
        msg.delete();
    }, 2000);
};

exports.help = {
    name: 'purge',
};
