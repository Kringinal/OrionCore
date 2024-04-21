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
        
        const { options } = interaction

        const addremovechoice = options.getString('addorremove');
        const amount = options.getNumber('amount')
        const usernames = options.getString('usernames')

        const usernamebreakdown = usernames.split(" ")

        var Profiles = await axios.get(`${config.firebaseURL}Profiles.json`)

         for (var pfl in Profiles.data) {
            if (Profiles.data[pfl].DiscordId == HostUserID){
                HostUserID = Profiles.data[pfl].toString().replace("_Info", "")
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
                    
                    interaction.reply({content: "", embeds: [EEmbed]})
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
                    
                    interaction.reply({content: "", embeds: [EEmbed]})
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
            
                logs[logs.Length] = {
                    DateTime: timestamp,
                    HostId: HostUserID,
                    Marks: amount,
                    Type: "Discord Integration"
                }

               	db.ref(`Profile/${UserId}_Info/`).set({
                    Marks: marks + amount,
                    Logs: logs,
                    LastUpdated: Lastupdated,
                    RobloxId: Robloxid,
                    DiscordId:  Discordid
                }).then(function(response) {
                    const REmbed = new EmbedBuilder()
                        .setTitle(`Successfully updated ${currentuser}'s profile!`)
                        .setDescription(``)
                        .setColor(0x5d65f3)
                        .setTimestamp()
        
                    interaction.Reply({content: "", embeds: [REmbed] });

                    const CurrRank = rblxFunctions.getRankInGroup(14765837, UserId)
                    const Requirements = axios.get(`${config.firebaseURL}Requirements.json`)

                    const NextRankRequirement = Requirements.data[CurrRank+1] ?? null

                    if (NextRankRequirement !== null) {
                        if (marks + amount >= NextRankRequirement) {
                            // PROMOTION!!!

			     var UserNameResponse = axios.post(`https://users.roblox.com/v1/users/` + UserId)
								     
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
