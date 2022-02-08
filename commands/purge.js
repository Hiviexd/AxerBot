exports.run = async (message, args) => {
    /*message.channel.bulkDelete(args);
    message.channel.send("deleted ${args} messages.");*/
    if (!args) {
        var newamount = 2;
      } else {
        var amount = Number(args);
        var adding = 1;
        var newamount = amount + adding;
      }
      let messagecount = newamount.toString();
      message.channel.fetchMessages({
          limit: messagecount
        })
        .then(messages => {
          message.channel.bulkDelete(messages);
          // Logging the number of messages deleted on both the channel and console.
          message.channel
            .send(
              "Deletion of messages successful. \n Total messages deleted including command: " +
                newamount
            )
            .then(message => message.delete(5000));
          console.log(
            "Deletion of messages successful. \n Total messages deleted including command: " +
              newamount
          );
        })
        .catch(err => {
          console.log("Error while doing Bulk Delete");
          console.log(err);
        });
}

exports.help = {
    name:"purge"
}
