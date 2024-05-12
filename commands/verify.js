const config = require('../config.json');

const { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const axios  = require('axios').default;
const firebase = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Initiates the verification system for Orion Core.')
    .addStringOption(option =>
        option.setName('username')
            .setDescription('Your ROBLOX username.')
            .setRequired(true)
    ),

    async execute(interaction) {
        const { options } = interaction
        const member = interaction.member.user.id
        const username = options.getString('username');

        const OrionRole = interaction.guild.roles.cache.find(role => role.id === config.OrionRole);
        const OfficerRole = interaction.guild.roles.cache.find(role => role.id === config.OfficerRole);
        const GuestRole = interaction.guild.roles.cache.find(role => role.id === config.GuestRole);

        var UserResponse = await axios.post(`https://users.roblox.com/v1/usernames/users`, {
            "usernames": [username],
            "excludeBannedUsers": true,
        })
        var Data = UserResponse.data.data[0]

        var InitProfile = await axios.get(`${config.firebaseURL}Profiles/${Data.id}_Info.json`)

        if (InitProfile.data !== null && InitProfile.data.RobloxId !== 0) {
            
            const newEmbed = new EmbedBuilder()
                .setTitle('ERROR')
                .setDescription("You've already verified!")
                .setColor(config.ErrorColor)
                .setThumbnail(config.GroupLogo);

            return interaction.reply({ embeds: [newEmbed] });
        } else {
            var UserId = null

            if (Data !== null){
                UserId = Data.id
            }

            var PendingResponse = await axios.get(`${config.firebaseURL}Pending/${UserId}.json`)
            
            var Avatar = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${UserId}&size=420x420&format=Png&isCircular=true`)

            if (PendingResponse.data && UserId !== 0) {
                return interaction.reply({ content: 'You can not have more than one verification prompt active at a time!' });
            } else {
                var data = await axios.get(`https://users.roblox.com/v1/users/${UserId}`)
                console.log(UserId, data.data, data.data.name)
                if (!data.data) {
                    return interaction.reply({ content: `Could not find the username ${username}. Please check your spelling and try again.` });
                }
                var displayName = data.data.name
                const page1 = new EmbedBuilder()
                    .setTitle('VERIFICATION')
                    .setDescription(`To verify account ownership, complete the [initiation course](https://www.roblox.com/games/10349904294/INITIATION-COURSE).`)
                    .setColor(0x5d65f3)
                    .setThumbnail(Avatar.data.data[0].imageUrl)
                    .setTimestamp()
                const page2 = new EmbedBuilder()
                    .setTitle('VERIFICATION')
                    .setDescription(`Sorry, but it looks like you haven't completed the [initiation course](https://www.roblox.com/games/10349904294/INITIATION-COURSE). Please complete the steps then click "DONE".`)
                    .setColor(config.ErrorColor)
                    .setThumbnail(Avatar.data.data[0].imageUrl)
                    .setTimestamp()
                const page3 = new EmbedBuilder()
                    .setTitle('VERIFICATION')
                    .setDescription(`Account ownership verified! Welcome to Orion Core, ${displayName}.`)
                    .setColor(0x5d65f3)
                    .setThumbnail(Avatar.data.data[0].imageUrl)
                    .setTimestamp()
                const page4 = new EmbedBuilder()
                    .setTitle('VERIFICATION')
                    .setDescription(`Account verification cancelled. To try again, run /verify.`)
                    .setColor(0x5d65f3)
                    .setThumbnail(config.GroupLogo)
                    .setTimestamp()
                const page5 = new EmbedBuilder()
                    .setTitle('TIMEOUT')
                    .setDescription(`Verification timed out. To try again, run /verify.`)
                    .setColor(0x5d65f3)
                    .setThumbnail(config.GroupLogo)
                    .setTimestamp()
                const page6 = new EmbedBuilder()
                    .setTitle('UNAUTHORIZED')
                    .setDescription(`I am not able to update your roles/nickname!`)
                    .setColor(config.ErrorColor)
                    .setThumbnail(Avatar.data.data[0].imageUrl)
                    .setTimestamp()
                const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('done')
                        .setLabel('DONE')
                        .setStyle(1),
                    new ButtonBuilder()
                        .setCustomId('cancel')
                        .setLabel('CANCEL')
                        .setStyle(4)
                );

                firebase.database().ref(`Pending/${UserId}`).set(member)

                interaction.reply({ embeds: [page1], components: [row]  }).then(message => {
                    const filter = i => i.user.id === interaction.user.id;
                    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 600000 });

                    collector.on('collect', async i => {
                        console.log(i.customId)
                        i.deferUpdate();
                        if (i.customId === 'done') {
                            var Profiles = await axios.get(`${config.firebaseURL}Profiles.json`)
                            var LastProfile
                            for (var pfl in Profiles.data) {
                    
                                if (Profiles.data[pfl].DiscordId == member){
                                    //console.log(Profiles.data[pfl])
                                    Profile = Profiles.data[pfl]
                                }
                            }

                            if (LastProfile !== null && LastProfile.RobloxId !== 0) {
                                console.log(LastProfile, LastProfile.RobloxId)
                                var GroupResponse = await axios.get(`https://groups.roblox.com/v2/users/${LastProfile.RobloxId}/groups/roles`)

                                if (GroupResponse.data.data.find(x => x.group.id === 14765837)){
                                    try {
                                        await interaction.member.roles.add(OrionRole)
                                        await interaction.member.roles.remove(GuestRole)
                    
                                        if (response.data.data.find(x => x.group.id === 14765837).role.rank >= 249) {
                                            await interaction.member.roles.add(OfficerRole)
                                        } else {
                                            await interaction.member.roles.remove(OfficerRole)
                                        }
                                    } catch {
                                        return interaction.editReply({ embeds: [page6], components: [] });
                                    }
                                } else {
                                    await interaction.member.roles.remove(OrionRole)
                                    await interaction.member.roles.remove(OfficerRole)
                                    await interaction.member.roles.add(GuestRole)
                                }

                                try {
                                    await interaction.member.setNickname(`${displayName}`)
                                } catch(err) {
                                    return interaction.editReply({ embeds: [page6], components: [] });
                                };

                                return interaction.editReply({ embeds: [page3], components: [] });
                            } else {
                                return interaction.editReply({ embeds: [page2], components: [row] });
                            };
                        } else if (i.customId === 'cancel') {
                            var LastPending = axios.get(`${config.firebaseURL}Pending/${UserId}.json`)

                            if (LastPending.data !== null) {
                                firebase.database().ref(`Pending/${UserId}`).set({})
                            }

                            return interaction.editReply({ embeds: [page4], components: [] });
                        };
                    })

                    collector.on('end', async i => {
                        var LastPending = await axios.get(`${config.firebaseURL}Pending/${UserId}.json`)

                        if (LastPending.data !== null) {
                            firebase.database().ref(`Pending/${UserId}`).set({})
                        }

                        return interaction.editReply({ embeds: [page5], components: [] });
                    });
                });
            }
        }
    },
};
