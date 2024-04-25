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
	    const UserProfile = Profiles.data[UserId + "_Info"]
	    const UserNameResponse = await axios.get(`https://users.roblox.com/v1/users/` + UserId)
	    const OldRank = await rblxFunctions.getRankInGroup(14765837, UserId)
	    const GroupRanks = await rblxFunctions.getRoles(14765837)
	    var OldRankName = "TEST"
	    var OldRankId = 0
	    var NextRank = "TEST"
	    var NewRankId = 0
	    
	    for (let i=0; i < GroupRanks.length; i++) {
		if (GroupRanks[i].rank == OldRank || GroupRanks[i].id == OldRank){
		  if (GroupRanks[i+1] == null){
		    NextRank = "Builderman"
		    NewRankId = i
		    OldRankName = GroupRanks[i].name
		    OldRankId = i
		  } else {
		    NextRank = GroupRanks[i+1].name
		    NewRankId = i+1
		    OldRankName = GroupRanks[i].name
		    OldRankId = i
		  }
		}
	    }

	    var Requirements = await axios.get(`${config.firebaseURL}Requirements.json`)
	    var NextAmount = 0

	    if (Requirements[NewRankId] !== null) {
		NextAmount = Requirements[NewRankId]
	    }

	    var Percentage = UserProfile.Marks / NextAmount
	    var PercentBar = ":black_large_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square:"

	    if (Percentage >= .1 && Percentage < .2) {
		PercentBar = ":green_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square:"
	    } else if (Percentage >= .2 && Percentage < .3) {
		PercentBar = ":green_square: :green_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square:"
	    } else if (Percentage >= .3 && Percentage < .4) {
		PercentBar = ":green_square: :green_square: :green_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square:"
	    } else if (Percentage >= .4 && Percentage < .5) {
		PercentBar = ":green_square: :green_square: :green_square: :green_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square:"
	    } else if (Percentage >= .5 && Percentage < .6) {
		PercentBar = ":green_square: :green_square: :green_square: :green_square: :green_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square:"
	    } else if (Percentage >= .6 && Percentage < .7) {
		PercentBar = ":green_square: :green_square: :green_square: :green_square: :green_square: :green_square: :black_large_square: :black_large_square: :black_large_square: :black_large_square:"
	    } else if (Percentage >= .7 && Percentage < .8) {
		PercentBar = ":green_square: :green_square: :green_square: :green_square: :green_square: :green_square: :green_square: :black_large_square: :black_large_square: :black_large_square:"
	    } else if (Percentage >= .8 && Percentage < .9) {
		PercentBar = ":green_square: :green_square: :green_square: :green_square: :green_square: :green_square: :green_square: :green_square: :black_large_square: :black_large_square:"
	    } else if (Percentage >= .9 && Percentage < 1) {
		PercentBar = ":green_square: :green_square: :green_square: :green_square: :green_square: :green_square: :green_square: :green_square: :green_square: :black_large_square:"
	    } else if (Percentage >= 1) {
		PercentBar = ":green_square: :green_square: :green_square: :green_square: :green_square: :green_square: :green_square: :green_square: :green_square: :green_square:"
	    }

	    var Avatar = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${UserId}&size=420x420&format=Png&isCircular=true`)

	    let StartEmbed = new EmbedBuilder()
              .setTitle(`${UserNameResponse.data.name}`)
	      .setUrl(`https://www.roblox.com/users/${UserId}/profile`)
              .setDescription(`${PercentBar} **${Percentage * 100}%** \n \nRank: **${OldRank}** \nMarks: **${UserProfile.Marks}** \n \n**${NextAmount - UserProfile.Marks}** Marks remaining for **${NextRank} (${NextAmount} Marks)**`)
              .setColor(0x5d65f3)
              .setThumbnail(Avatar.data.data[0].imageUrl)
              .setTimestamp()

            return interaction.reply({ embeds: [StartEmbed]})
        }   
    }
}
