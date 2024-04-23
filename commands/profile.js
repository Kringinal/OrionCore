const config = require('../config.json');

const { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const axios  = require('axios').default;
const rblxFunctions = require("noblox.js");
const firebase = require('firebase-admin');
let db = firebase.database();


module.exports = {
    data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View the profile of the provided user.')
    .addStringOption((option) =>
        option.setName('username')
            .setDescription(`Enter the username you'd like to view.`)
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
              .setTitle('COULD NOT FIND PROFILE')
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
           /* const UserNameResponse = await axios.get(`https://users.roblox.com/v1/users/` + UserId)
            var CurrentEditingProfile = Profiles.data[UserId + "_Info"]
            var logs = CurrentEditingProfile.Logs
           
            let StartEmbed = new EmbedBuilder()
              .setTitle(`${UserNameResponse.data.name}'s Logs (${currentlog}/${maxLogs})`)
              .setDescription(`EVENT TYPE: **${StartingLogInfo.Type}** \nHOST: **${StartingHostInfo.data.name}** \nAMOUNT: **${StartingLogInfo.Marks}**`)
              .setColor(0x5d65f3)
              .setThumbnail(StartingHostAvatar.data.data[0].imageUrl)
              .setTimestamp(StartingLogInfo.DateTime)

            interaction.reply({ embeds: [StartEmbed]})
           */
        }   
    }
}
