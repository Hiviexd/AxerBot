const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'messageUpdate',
    execute(message, oldMessage, newMessage) {
        if (message.author.bot) return;
        if (message.channel.type === 'dm') return;
        if (!oldMessage.author) return;

        const embed = new MessageEmbed()
            .setColor('#008cff')
            .setAuthor(`${message.author.username} edited a message in #${message.channel.name}`, message.author.displayAvatarURL())
            .setFields(
                { name: 'Old Message', value: oldMessage.cleanContent },
                { name: 'New Message', value: newMessage.cleanContent }
            )
            .setTimestamp();
            //TODO: figure out a way to send a message and the embed in the same .send()
            //client.channels.cache.find(c => c.name === "wasteland-test").send(`:x: Deleted from <#${message.channel.id}>`);
            console.log(embed);
            client.channels.cache.find(c => c.name === "wasteland-test").send({ embeds: [embed] });
      }
}