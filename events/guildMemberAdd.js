module.exports = {
    name: 'guildMemberAdd',
    execute(member) {
        //Log the newly joined member to console
        console.log('User ' + member.user.tag + ' has joined the server!');

        //Find a channel named welcome and send a Welcome message
        member.guild.channels.cache.find(c => c.name === "arrival").send('Welcome, '+ member.user.username + '! Please link your osu! profile, tell us whether you want the Participant or Spectator role, and tell us your favorite FA in order to get access to the channels!')
    }
}