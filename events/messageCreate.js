module.exports = {
    name: 'messageCreate', 
    execute(message) {
        //Check if author is a bot or the message was sent in dms and return
        if (message.author.bot) return;
        if (message.channel.type === 'dm') return;

        if (message.content.includes("axer") === true) {
            //gm will never be sent for some reason i cba to debug this
            let quotes = [`gm`, `ඞ`, `what do you want`, `I need to meet an Argentine girl so I can groom her`, `CHILDREN!!!!1!!`, `Connection terminated. I'm sorry to interrupt you, ${message.author.username}, if you still even remember that name, But I'm afraid you've been misinformed. You are not here to receive a badge, nor have you been called here by the individual you assume, although, you have indeed been called.`];
            let rnd =  Math.floor(Math.random() * quotes.length)

            message.channel.send(quotes[rnd]);
        }
    }
}