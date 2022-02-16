const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'messageDelete',
    execute(message, client) {
        if (message.author.bot) return;
        if (message.channel.type === 'dm') return;

        const embed = new MessageEmbed()
            .setColor('#ff5050')
            .setAuthor(`${message.author.username} deleted a message from #${message.channel.name}`, message.author.displayAvatarURL())
            .setDescription(`**Message:** ${message.cleanContent}`)
            .setTimestamp();

            //TODO: figure out a way to send a message and the embed in the same .send()
            //client.channels.cache.find(c => c.name === "wasteland-test").send(`:x: Deleted from <#${message.channel.id}>`);
            client.channels.cache.find(c => c.name === "wasteland").send({ embeds: [embed] });
      }
}