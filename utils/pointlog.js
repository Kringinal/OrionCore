const { EmbedBuilder } = require('discord.js');
let axios = require('axios').default;
let client;

module.exports = {
  registerclient: function(newclient){
    client = newclient
  },
  
  logpromotion: async function (TargetUserId, OldRank, NewRank) {
    const { data } = await axios.get(`http://users.roblox.com/v1/users/${TargetUserId}`);

    try {
      const user = {
        username: data.Username,
        roblox_id: data.Id
      };

     const embed = new EmbedBuilder()
      .setTitle(`**PROMOTION**`)
      .setDescription(`[${user.username}](https://www.roblox.com/users/${user.roblox_id}/profile) has been promoted! \n \n PREV: **${OldRank} ** \n NEW: **${NewRank}**`)
      .setTimestamp()
      .setColor(`#8CFF00`)       
      .setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${user.roblox_id}&width=420&height=420&format=png`)

       let guild = client.guilds.get('1127497593941934161');
       const channel =  guild.channels.get('1127497595045040216');
       return channel.send({ embeds: [embed] })
    } catch (er) {
      console.log(er)
    }
  },

  logAccpetance: async function (TargetUserId) {
    const { data } = await axios.get(`http://users.roblox.com/v1/users/${TargetUserId}`);

    try {
      const user = {
        username: data.Username,
        roblox_id: data.Id
      };

     const embed = new EmbedBuilder()
      .setTitle(`**ACCEPTANCE**`)
      .setDescription(`[${user.username}](https://www.roblox.com/users/${user.roblox_id}/profile) has been accepted into **Orion Core**! \n \n **ACCEPTANCE OBBY COMPLETED**`)
      .setTimestamp()
      .setColor(`#8CFF00`)       
      .setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${user.roblox_id}&width=420&height=420&format=png`)

       let guild = client.guilds.get('1127497593941934161');
       const channel =  guild.channels.get('1127497595045040216');
       return channel.send({ embeds: [embed] })
    } catch (er) {
      console.log(er)
    }
  },

  sendmessage: async function (ChannelId, embeds) {
    try {
       let guild = client.guilds.get('1127497593941934161');
       const channel =  guild.channels.get(ChannelId);
       return channel.send({embeds})
    } catch (er) {
      console.log(er)
    }
  }
};
