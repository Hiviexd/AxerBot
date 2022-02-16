module.exports = {
    name: 'messageDelete',
    execute(message, client) {
        //console.log(`a message saying "${message.cleanContent}" was deleted from channel: ${message.channel.name} at ${new Date()}`);
        if (message.author.bot) return;
        if (message.channel.type === 'dm') return;
        client.channels.cache.find(c => c.name === "wasteland").send(
            `:x: Deleted from <#${message.channel.id}>
            
        **${message.author.tag}**:
        "${message.cleanContent}"`
        );
            //TODO: preferably have all of these in an embed
      }
}