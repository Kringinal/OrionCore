const config = require('../config.json');

const { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const axios  = require('axios').default;
const rblxFunctions = require("noblox.js");
const firebase = require('firebase-admin');
let db = firebase.database();

const logPromotion = require('../utils/pointlog.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('marks')
    .setDescription('add/remove provided username(s) Marks.')
    .addStringOption((option) =>
        option.setName('addorremove')
	    .setDescription('Choose whether you want to add/remove Marks.')
	    .setRequired(true)
	    .addChoices(
		{ name: 'Add', value: 'add' },
		{ name: 'Remove', value: 'remove' },
	    )
    )
    .addNumberOption((option) =>
        option.setName('amount')
	    .setDescription('The amount of Marks you want to give/remove.')
            .setRequired(true)
            .setMinValue(-7)
            .setMaxValue(7)
    )
    .addStringOption((option) =>
        option.setName('usernames')
            .setDescription('Enter the username(s) of those you would like to be affected.')
            .setRequired(true)
    ),


    async execute(interaction) {
        var HostUserID = interaction.member.user.id

	var MessageResponse = interaction.reply({ content: `Processing Command...`});

	var EmbedList;
	    
        const { options } = interaction

        const addremovechoice = options.getString('addorremove');
        const amount = options.getNumber('amount')
        const usernames = options.getString('usernames')

        const usernamebreakdown = usernames.split(" ")
	console.log(usernamebreakdown.length)
	    
        var Profiles = await axios.get(`${config.firebaseURL}Profiles.json`)

         for (var pfl in Profiles.data) {
            if (Profiles.data[pfl].DiscordId == HostUserID){
                HostUserID = Profiles.data[pfl].RobloxId
            }
        }
        
        for (const currentuser of usernamebreakdown) {
            var UserId;
            
            if (currentuser.startsWith("<@")) {
                const RevisedDiscordID = currentuser.toString().replace(/[\\<>@#&!]/g, "")

                for (var pfl in Profiles.data) {
                    if (Profiles.data[pfl].DiscordId == RevisedDiscordID){
                        UserId = Profiles.data[pfl].toString().replace("_Info", "")
                    }
                }

                if (UserId == null) {
                    const EEmbed = new EmbedBuilder()
                        .setTitle('COULD NOT EDIT PROFILE')
                        .setDescription(`The mentioned user ${currentuser}, is not verified with the Orion Bot.`)
                        .setColor(config.ErrorColor)
                        .setThumbnail(config.GroupLogo)
                        .setTimestamp()
                    
                    EmbedList = EmbedList + EEmbed
                    
                    interaction.editReply({content: "", embeds: [EmbedList]})
                }
            } else {
                var UserResponse = await axios.post(`https://users.roblox.com/v1/usernames/users`, {
                     "usernames": [currentuser],
                    "excludeBannedUsers": true,
                })
                var Data = UserResponse.data.data[0]

                if (Data !== null){
                    UserId = Data.id
                } else {
                     const EEmbed = new EmbedBuilder()
                        .setTitle('COULD NOT EDIT PROFILE')
                        .setDescription(`The provided username ${currentuser}, does not exit on ROBLOX.`)
                        .setColor(config.ErrorColor)
                        .setThumbnail(config.GroupLogo)
                        .setTimestamp()

			EmbedList = EmbedList + EEmbed
                    
                    interaction.editReply({content: "", embeds: [EmbedList]})
                }
            }

            const currentDate = new Date();
            const timestamp = currentDate.getTime();
            
            if (Profiles.data[UserId + "_Info"]) {
               var CurrentEditingProfile = Profiles.data[UserId + "_Info"]
                    var marks = CurrentEditingProfile.Marks
                    var logs = CurrentEditingProfile.Logs
                    var Lastupdated = CurrentEditingProfile.LastUpdated
                    var Discordid = CurrentEditingProfile.DiscordId
                    var Robloxid = CurrentEditingProfile.RobloxId
            
                logs[logs.length] = {
                    DateTime: timestamp,
                    HostId: HostUserID,
                    Marks: amount,
                    Type: "Discord Integration"
                }

               	db.ref(`Profiles/${UserId}_Info/`).set({
                    Marks: marks + amount,
                    Logs: logs,
                    LastUpdated: Lastupdated,
                    RobloxId: Robloxid,
                    DiscordId:  Discordid
                }).then(async function(response) {
                    const REmbed = new EmbedBuilder()
                        .setTitle(`Successfully updated ${currentuser}'s profile!`)
                        .setColor(0x5d65f3)
                        .setTimestamp()

			EmbedList = EmbedList + REmbed
                    
                    interaction.editReply({content: "", embeds: [EmbedList]})

                    const CurrRank = await rblxFunctions.getRankInGroup(14765837, UserId)
                    const Requirements = await axios.get(`${config.firebaseURL}Requirements.json`)

			console.log(Requirements.data)
                    if (Requirements.data[CurrRank+1] !== null) {
                        if (marks + amount >= Requirements.data[CurrRank+1]) {
			     var UserNameResponse = await axios.post(`https://users.roblox.com/v1/users/` + UserId)
								     
			     axios({
				  method: 'post',
				  url: `https://orioncore-3b6068b75ef5.herokuapp.com/api/promote`,
				  headers: {}, 
				  data: {
				    userid: UserId,
				    username: UserNameResponse.data.name,
				  }
			     });
                        }
                    }
                })
            }
        }
    },
};
