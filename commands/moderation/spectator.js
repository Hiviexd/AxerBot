const { ownerId } = require('../../config.json');

exports.run = async (bot, message, args) => {
    //let whitelist = ['Owner', 'Host', 'Judge', 'Moderator', 'Mod'];
    //let bool = message.member.roles.cache.some((role) => whitelist.some(wl => role === wl))
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
    
    let spectator = message.guild.roles.cache.find(r => r.name === "Spectator");
    let verified = message.guild.roles.cache.find(r => r.name === "Verified");
    let member = message.mentions.members.first();
    args.shift();
    let nickname = args.join(' ');
    
    

    if (!nickname) {
        member.roles.add(verified).catch((err) => {
            message.channel.send(
                ':x: Error setting verified role.'
            );
        });
        member.roles.add(spectator).catch((err) => {
            message.channel.send(
                ':x: Error setting spectator role.'
            );
        });
        message.channel.send(`:white_check_mark: Applied roles!`);
        return ;
    }

    if (args.length<1) {
        let msg = await message.channel.send(":exclamation: **Syntax:** ``!spectator @user <nickname>``");
        setTimeout(() => {
            msg.delete();
        }, 3000);
        return ;
    }

    member.roles.add(verified).catch((err) => {
        message.channel.send(
            ':x: Error setting verified role.'
        );
    });
    member.roles.add(spectator).catch((err) => {
        message.channel.send(
            ':x: Error setting spectator role.'
        );
    });

    member.setNickname(nickname).catch((err) => {
        message.channel.send(
            ':x: Error setting nickname.'
        );
    });

    message.channel.send(`:white_check_mark: Applied role and changed nickname to **${nickname}**!`);
    
};

exports.help = {
    name: 'spectator',
};
