const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'messageDelete',
    execute(message) {
        if (message.author.bot) return;
        if (message.channel.type === 'dm') return;
        if (!message.guild.channels.cache.find(c => c.name === "wasteland")) return;

        const embed = new MessageEmbed()
            .setColor('#ff5050')
            .setAuthor(`${message.author.username}`, message.author.displayAvatarURL())
            .setDescription(`:x:  deleted a message from ${message.channel}\n\n**Message:** \n${message.cleanContent}`)
            .setTimestamp();

        if (message.attachments.size > 0) {
            embed.setImage(message.attachments.first().url);
        }

        message.guild.channels.cache.find(c => c.name === "wasteland").send({ embeds: [embed] });

    }
}