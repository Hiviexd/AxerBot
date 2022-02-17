const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'messageUpdate',
    execute(oldMessage, newMessage) {
        if (oldMessage.author.bot) return;
        if (oldMessage.channel.type === 'dm') return;
        if (!oldMessage.author) return;

        const count = 1950;
        const original = oldMessage.content.slice(0, count) + (oldMessage.content.length > count ? '...' : '');
        const edited = newMessage.content.slice(0, count) + (newMessage.content.length > count ? '...' : '');

        const embed = new MessageEmbed()
            .setColor('#008cff')
            .setAuthor(`${newMessage.author.username}`, newMessage.author.displayAvatarURL())
            .setDescription(`:pencil:  edited a message in ${newMessage.channel}\n\n**Before:** \n${original}\n\n**After:** \n${edited}\n`)
            .setTimestamp();
        
        if (newMessage.attachments.size > 0) {
            embed.setImage(newMessage.attachments.first().url);
        }

            newMessage.guild.channels.cache.find(c => c.name === "wasteland-test").send({ embeds: [embed] });

      }
}

