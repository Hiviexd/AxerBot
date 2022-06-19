import moment from 'moment';
import { Client, Message, MessageOptions, MessagePayload, TextChannel } from 'discord.js';
import * as database from "../../database";

export default async (bot: Client) => {
    let users = await database.users.find();
    users.forEach(user => {
        if (user.reminders.length > 0) {
            user.reminders.forEach(async (reminder: { time: moment.MomentInput; guild: string; channel: string; message: any; }) => {
                if (moment().diff(moment(reminder.time), 'seconds') >= 0) {
                    let guild = bot.guilds.cache.get(reminder.guild);
                    if (guild) {
                        let channel = await bot.channels.fetch(reminder.channel) as TextChannel;
                        if (channel) {
                            channel.send(`<@${user._id}> ${reminder.message}`);
                        }
                    }
                    user.reminders.splice(user.reminders.indexOf(reminder), 1);
                    await database.users.findByIdAndUpdate(user._id, user);
                }
            });
        }
    })
}

            
   


    
