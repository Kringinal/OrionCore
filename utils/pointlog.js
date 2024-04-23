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
     const embed = new EmbedBuilder()
      .setTitle(`**PROMOTION**`)
      .setDescription(`[${data.name}](https://www.roblox.com/users/${TargetUserId}/profile) has been promoted! \n \n PREV: **${OldRank} ** \n NEW: **${NewRank}**`)
      .setTimestamp()
      .setColor(`#8CFF00`)       
      .setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${TargetUserId}&width=420&height=420&format=png`)

       const channel = client.channels.cache.find(ch => ch.name == "🔰┊promotions")
       return channel.send({ embeds: [embed] })
    } catch (er) {
      console.log(er)
    }
  },

  logAccpetance: async function (TargetUserId) {
    const { data } = await axios.get(`http://users.roblox.com/v1/users/${TargetUserId}`);

    try {

     const embed = new EmbedBuilder()
      .setTitle(`**ACCEPTANCE**`)
      .setDescription(`[${data.name}](https://www.roblox.com/users/${TargetUserId}/profile) has been accepted into **Orion Core**! \n \n **ACCEPTANCE OBBY COMPLETED**`)
      .setTimestamp()
      .setColor(`#8CFF00`)       
      .setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${TargetUserId}&width=420&height=420&format=png`)

       const channel = client.channels.cache.find(ch => ch.name == "🔰┊promotions")
       return channel.send({ embeds: [embed] })
    } catch (er) {
      console.log(er)
    }
  },

  sendmessage: async function (ChannelId, embeds) {
    try {
       const channel = client.channels.cache.find(ch => ch.id == ChannelId)
       return channel.send({embeds})
    } catch (er) {
      console.log(er)
    }
  }
};
