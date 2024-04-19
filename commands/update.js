const config = require('../config.json');

const { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const axios  = require('axios').default;
const firebase = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('update')
    .setDescription('Updates a users roles'),


    async execute(interaction) {
        const member = interaction.member.user.id

        //const OrionRole = interaction.guild.roles.cache.get(config.OrionRole);

        var Profiles = await axios.get(`${config.firebaseURL}Profiles.json`)
        var Profile
        for (var pfl in Profiles.data) {

            if (Profiles.data[pfl].DiscordId == member){
                //console.log(Profiles.data[pfl])
                Profile = Profiles.data[pfl]
            }
        }

        const OrionRole = interaction.guild.roles.cache.find(r => r.name === config.OrionRole);
        const OfficerRole = interaction.guild.roles.cache.find(r => r.name === config.OfficerRole);
        const GuestRole = interaction.guild.roles.cache.find(r => r.name === config.GuestRole); 

        if (Profile && Profile.RobloxId !== 0) {
            var MessageResponse = interaction.reply({ content: `Processing Command...`});
            var bodys = await axios.get(`https://users.roblox.com/v1/users/${Profile.RobloxId}`)
            var response = await axios.get(`https://groups.roblox.com/v2/users/${Profile.RobloxId}/groups/roles`)

            const page6 = new EmbedBuilder()
                    .setTitle('UNAUTHORIZED')
                    .setDescription(`I am not able to update your roles/nickname!`)
                    .setColor(config.ErrorColor)
                    .setThumbnail(config.GroupLogo);

            if (response.data.data.find(x => x.group.id === 14765837)){
                try {
                    await interaction.member.roles.add(OrionRole)
                    await interaction.member.roles.remove(GuestRole)

                    if (x.Role.rank >== 249) {
                        await interaction.member.roles.add(OfficerRole)
                    } else {
                        await interaction.member.roles.add(OfficerRole)
                    }
                } catch {
                    return interaction.editReply({content: "COULDNT GIVE ROLES", embeds: [page6], components: [] });
                }
            } else {
                await interaction.member.roles.remove(OrionRole)
                await interaction.member.roles.remove(OfficerRole)
                await interaction.member.roles.add(GuestRole)
            }

            var displayName = bodys.data.name

            try {
                await interaction.member.setNickname(`${displayName}`)
            } catch(err) {
                return interaction.editReply({content: "COULDNT CHANGE NICKNAME", embeds: [page6], components: [] });
            };
            
            const REmbed = new EmbedBuilder()
                .setTitle('VERIFICATION')
                .setDescription(`Successfully updated your roles!`)
                .setColor(0x5d65f3)
                .setThumbnail(config.GroupLogo);

            return interaction.editReply({content: "", embeds: [REmbed] });
        } else {
            const EEmbed = new EmbedBuilder()
                .setTitle('ERROR')
                .setDescription(`You're not verified! Use /verify to link your ROBLOX account.`)
                .setColor(config.ErrorColor)
                .setThumbnail(config.GroupLogo);

            return interaction.editReply({content: "", embeds: [EEmbed]})
        }
    },
};
