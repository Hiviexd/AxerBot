const fs = require('fs');
const readline = require('readline');

async function processFile() {
    const fileStream = fs.createReadStream('./data/axer.txt');
    const returnArray = [];
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    // Note: crlfDelay is to recognize all instances of CR LF
    // ('\r\n') in the .txt as a single line break.
  
    for await (const line of rl) {
      // Each line in the .txt will be successively available here as `line`.
      //TODO: fetch lines as template literals instead of strings with quotes
      returnArray.push(line);
    }

    return returnArray;
  }

module.exports = {
    name: 'messageCreate', 
    execute(message) {
        //Check if author is a bot or the message was sent in dms and return
        if (message.author.bot) return;
        if (message.channel.type === 'dm') return;
        //toUpperCase makes the keyword case insensitive
        if (message.content.toUpperCase().includes("AXER") === true) {
            //let quotes = [`gm`, `ඞ`, `what do you want`, `I need to meet an Argentine girl so I can groom her`, `CHILDREN!!!!1!!`, `Connection terminated. I'm sorry to interrupt you, ${message.author.username}, if you still even remember that name, But I'm afraid you've been misinformed. You are not here to receive a badge, nor have you been called here by the individual you assume, although, you have indeed been called.`];
            processFile().then(function(data) {
                let quotes = data;
                let randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                console.log(quotes);
                message.channel.send(randomQuote);
            });
        }
    }
}