module.exports = {
    name: 'messageCreate', 
    execute(message) {
        //Check if author is a bot or the message was sent in dms and return
        if (message.author.bot) return;
        if (message.channel.type === 'dm') return;

        if (message.content.includes("axer") === true) {
            //gm will never be sent for some reason i cba to debug this
            let quotes = [`gm`, `ඞ`, `what do you want`, `I need to meet an Argentine girl so I can groom her`, `CHILDREN!!!!1!!`];
            let rnd =  Math.floor(Math.random() * quotes.length)

            message.channel.send(quotes[rnd]);
        }
    }
}