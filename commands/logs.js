const config = require('../config.json');

const { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const axios  = require('axios').default;
const rblxFunctions = require("noblox.js");
const firebase = require('firebase-admin');
let db = firebase.database();


module.exports = {
    data: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('View logs of the provided username.')
    .addStringOption((option) =>
        option.setName('username')
            .setDescription(`Enter the username you'd like to view logs of.`)
            .setRequired(false)
    ),


    async execute(interaction) {
	    
        const { options } = interaction
        var username = options.getString('username')

       if (username == null) {
         username = `<@` + interaction.member.user.id + `>`
       }
	    
        var Profiles = await axios.get(`${config.firebaseURL}Profiles.json`)

        var UserId = null

        if (username.startsWith("<@")) {
          const RevisedDiscordID = username.toString().replace(/[\\<>@#&!]/g, "")

          for (var pfl in Profiles.data) {
              if (Profiles.data[pfl].DiscordId == RevisedDiscordID){
                  UserId = pfl.toString().replace("_Info", "")
              }
          }

           if (UserId == null) {	
            const EEmbed = new EmbedBuilder()
              .setTitle('COULD NOT EDIT PROFILE')
              .setDescription(`The mentioned user ${username}, is not verified with the Orion Bot.`)
              .setColor(config.ErrorColor)
              .setThumbnail(config.GroupLogo)
              .setTimestamp()

		          return interaction.channel.send({content: "", embeds: [EEmbed]})
           }
        } else {
            var UserResponse = await axios.post(`https://users.roblox.com/v1/usernames/users`, {
                 "usernames": [username],
                "excludeBannedUsers": true,
            })
              var Data = UserResponse.data.data[0]

              if (Data !== null){
                  UserId = Data.id
              } else {
                 const EEmbed = new EmbedBuilder()
                    .setTitle('COULD NOT EDIT PROFILE')
                    .setDescription(`The provided username ${username}, does not exist on ROBLOX.`)
                    .setColor(config.ErrorColor)
                    .setThumbnail(config.GroupLogo)
                    .setTimestamp()
    
                  interaction.channel.send({content: "", embeds: [EEmbed]})
              }
        }

         if (Profiles.data[UserId + "_Info"]) {
           const UserNameResponse = await axios.get(`https://users.roblox.com/v1/users/` + UserId)
            var CurrentEditingProfile = Profiles.data[UserId + "_Info"]
            var logs = CurrentEditingProfile.Logs

            var minLogs = 0
            var maxLogs = logs.length-1
            var currentlog = logs.length-1

            var StartingLogInfo = CurrentEditingProfile.Logs[currentlog]
            var StartingHostInfo = await axios.get(`https://users.roblox.com/v1/users/` + StartingLogInfo.HostId)
            var StartingHostAvatar = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${StartingLogInfo.HostId}&size=420x420&format=Png&isCircular=true`)

            const row = new ActionRowBuilder()
              .addComponents(
                  new ButtonBuilder()
                      .setCustomId('previous')
                      .setLabel('PREVIOUS')
                      .setStyle(2)
                      .setDisabled(false),
                  new ButtonBuilder()
                      .setCustomId('next')
                      .setLabel('NEXT')
                      .setStyle(2)
                      .setDisabled(true),
            );

            const normalrow = new ActionRowBuilder()
              .addComponents(
                  new ButtonBuilder()
                      .setCustomId('previous')
                      .setLabel('PREVIOUS')
                      .setStyle(2)
                      .setDisabled(false),
                  new ButtonBuilder()
                      .setCustomId('next')
                      .setLabel('NEXT')
                      .setStyle(2)
                      .setDisabled(false),
            );

	   const norow = new ActionRowBuilder()
              .addComponents(
                  new ButtonBuilder()
                      .setCustomId('previous')
                      .setLabel('PREVIOUS')
                      .setStyle(2)
                      .setDisabled(true),
                  new ButtonBuilder()
                      .setCustomId('next')
                      .setLabel('NEXT')
                      .setStyle(2)
                      .setDisabled(true),
            );

           const disabledprev = new ActionRowBuilder()
              .addComponents(
                  new ButtonBuilder()
                      .setCustomId('previous')
                      .setLabel('PREVIOUS')
                      .setStyle(2)
                      .setDisabled(true),
                  new ButtonBuilder()
                      .setCustomId('next')
                      .setLabel('NEXT')
                      .setStyle(2)
                      .setDisabled(false),
            );

           let StartEmbed = new EmbedBuilder()
              .setTitle(`${UserNameResponse.data.name}'s Logs (${currentlog}/${maxLogs})`)
              .setDescription(`EVENT TYPE: **${StartingLogInfo.Type}** \nHOST: **${StartingHostInfo.data.name}** \nAMOUNT: **${StartingLogInfo.Marks}**`)
              .setColor(0x5d65f3)
              .setThumbnail(StartingHostAvatar.data.data[0].imageUrl)
              .setTimestamp(StartingLogInfo.DateTime)

		
		 
          interaction.reply({ embeds: [StartEmbed], components: [minLogs >= maxLogs && norow || row]  }).then(message => {
             const filter = i => i.user.id === interaction.user.id;
             const collector = message.createMessageComponentCollector({ filter, time: 300000 });

             collector.on('collect', async i => {
                i.deferUpdate();
                if (i.customId === 'next') {
                  currentlog = currentlog + 1

                  var CurrentLogInfo = CurrentEditingProfile.Logs[currentlog]
                  var CurrentHostInfo = await axios.get(`https://users.roblox.com/v1/users/` + CurrentLogInfo.HostId)
                  var CurrentHostAvatar = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${CurrentLogInfo.HostId}&size=420x420&format=Png&isCircular=true`)

                  let UpdatedEmbed = new EmbedBuilder()
                    .setTitle(`${UserNameResponse.data.name}'s Logs (${currentlog}/${maxLogs})`)
                    .setDescription(`EVENT TYPE: **${CurrentLogInfo.Type}** \nHOST: **${CurrentHostInfo.data.name}** \nAMOUNT: **${CurrentLogInfo.Marks}**`)
                    .setColor(0x5d65f3)
                    .setThumbnail(CurrentHostAvatar.data.data[0].imageUrl)
                    .setTimestamp(CurrentLogInfo.DateTime)
                  
                  if (currentlog >= maxLogs) {
                    interaction.editReply({ embeds: [UpdatedEmbed], components: [row] });
                  } else {
                     interaction.editReply({ embeds: [UpdatedEmbed], components: [normalrow] });
                  }
                } else if (i.customId === 'previous') {
                   currentlog = currentlog - 1

                  var CurrentLogInfo = CurrentEditingProfile.Logs[currentlog]
                  var CurrentHostInfo = await axios.get(`https://users.roblox.com/v1/users/` + CurrentLogInfo.HostId)
                  var CurrentHostAvatar = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${CurrentLogInfo.HostId}&size=420x420&format=Png&isCircular=true`)

                  let UpdatedEmbed = new EmbedBuilder()
                    .setTitle(`${UserNameResponse.data.name}'s Logs (${currentlog}/${maxLogs})`)
                    .setDescription(`EVENT TYPE: **${CurrentLogInfo.Type}** \nHOST: **${CurrentHostInfo.data.name}** \nAMOUNT: **${CurrentLogInfo.Marks}**`)
                    .setColor(0x5d65f3)
                    .setThumbnail(CurrentHostAvatar.data.data[0].imageUrl)
                    .setTimestamp(CurrentLogInfo.DateTime)
                  
                  if (currentlog <= minLogs) {
                    interaction.editReply({ embeds: [UpdatedEmbed], components: [disabledprev] });
                  } else {
                     interaction.editReply({ embeds: [UpdatedEmbed], components: [normalrow] });
                  }
                }
             })   
         })
    }
}
}
