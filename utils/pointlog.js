const { EmbedBuilder } = require('discord.js');
let axios = require('axios').default;
let client;

module.exports = {
  registerclient: function(newclient){
    client = newclient
  },
  
  logpromotion: async function (TargetUserId, OldRank, NewRank) {
    const { data } = await axios.get(`http://users.roblox.com/v1/users/${TargetUserId}`);
    var Avatar = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${TargetUserId}&size=420x420&format=Png&isCircular=true`)
    
   const embed = new EmbedBuilder()
    .setTitle(`**PROMOTION**`)
    .setDescription(`[${data.name}](https://www.roblox.com/users/${TargetUserId}/profile) has been promoted! \n \n PREV: **${OldRank} ** \n NEW: **${NewRank}**`)
    .setTimestamp()
    .setColor(`#8CFF00`)       
    .setThumbnail(Avatar.data.data[0].imageUrl)

     const channel = client.channels.cache.find(ch => ch.name == "🔰┊promotions")
     return channel.send({ embeds: [embed] })
  },

  logAccpetance: async function (TargetUserId) {
    const { data } = await axios.get(`http://users.roblox.com/v1/users/${TargetUserId}`);
    var Avatar = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${TargetUserId}&size=420x420&format=Png&isCircular=true`)

    const embed = new EmbedBuilder()
    .setTitle(`**ACCEPTANCE**`)
    .setDescription(`[${data.name}](https://www.roblox.com/users/${TargetUserId}/profile) has been accepted into **Orion Core**! \n \n **VERIFICATION OBBY COMPLETED**`)
    .setTimestamp()
    .setColor(`#8CFF00`)       
    .setThumbnail(Avatar.data.data[0].imageUrl)

     const channel = client.channels.cache.find(ch => ch.name == "🔰┊promotions")
     return channel.send({ embeds: [embed] })
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
