const config = require('../config.json');

const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

const snekfetch = require('snekfetch');
const firebase = require('firebase');

module.exports = {
    data: [{
    name: 'verify',
    description: 'Verifies a user with their Roblox account.',
    options: [{
        name: 'username',
        description: 'Your Roblox username',
        required: true,
        type: 'STRING'
    }],
}],

    async execute(interaction) {
        const { options } = interaction
        const member = interaction.member.user.id

        const verifiedRole = interaction.guild.roles.cache.find(role => role.name === config.OrionRole);

        if (interaction.member.roles.cache.some(role => role.name === config.OrionRole)) {
            return interaction.reply({ content: 'You are already verified! Consider running /update instead.', ephemeral: true });
        }

        var { body } = await snekfetch.get(`${config.firebaseURL}profile/${member}.json`)

        if (body) {
            var { body } = await snekfetch.get(`https://users.roblox.com/v1/users/${body.RobloxId}`)
            var { data } = await snekfetch.get(`https://groups.roblox.com/v2/users/${body.RobloxId}/groups/roles`)

            if (data.find(x => x.id === 14765837)){
                await interaction.member.roles.add(OrionRole);
            }

            var displayName = body.name
 
            interaction.member.setNickname(`${body.name}`);
            
            const newEmbed = new MessageEmbed()
                .setTitle('VERIFICATION')
                .setDescription('You have been successfully verified!')
                .setColor('00ff99')

            return interaction.reply({ embeds: [newEmbed], ephemeral: true });
        } else {
            const username = options.getString('username');
            var UserId

            var response = await snekfetch.post(`https://users.roblox.com/v1/usernames/users`, {
                "usernames": [username],
                "excludeBannedUsers": true,
            })

            if (response.data.length > 0){
                UserId = response.data.id
            }

            var { body } = await snekfetch.get(`${config.firebaseURL}pending/${UserId}.json`)

            if (body) {
                return interaction.reply({ content: 'You can not have more than one verification prompt active at a time!', ephemeral: true });
            } else {
                var { body } = await snekfetch.get(`https://users.roblox.com/v1/users/${UserId}`)

                if (!body.name) {
                    return interaction.reply({ content: `Could not find the username ${username}. Please check your spelling and try again.`, ephemeral: true });
                }

                var displayName = body.name

                const page1 = new MessageEmbed()
                    .setTitle('Verification')
                    .setDescription(`To verify account ownership, join the [verification game](${config.verificationLink}).`)
                    .setColor('0x5d65f3');
                const page2 = new MessageEmbed()
                    .setTitle('Verification')
                    .setDescription(`Sorry, but it looks like you haven't completed the steps in the [verification game](${config.verificationLink}). Please complete the steps then click next.`)
                    .setColor('0x5d65f3');
                const page3 = new MessageEmbed()
                    .setTitle('Verification')
                    .setDescription(`Account ownership verified! Welcome to Orion Core, ${displayName}.`)
                    .setColor('0x5d65f3');
                const page4 = new MessageEmbed()
                    .setTitle('Verification')
                    .setDescription(`Account verification cancelled. To try again, run /verify.`)
                    .setColor('0x5d65f3');
                const page5 = new MessageEmbed()
                    .setTitle('Verification')
                    .setDescription(`Verification timed out. To try again, run /verify.`)
                    .setColor('0x5d65f3');
                const row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId('verification_code_next')
                        .setLabel('Next')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('verification_cancel')
                        .setLabel('Cancel')
                        .setStyle('DANGER')
                );

                firebase.database().ref(`pending/${userId}`).set(member)

                interaction.reply({ embeds: [page1], components: [row], ephemeral: true }).then(message => {
                    const filter = i => i.user.id === member;
                    const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 300000 });

                    collector.on('collect', async i => {
                        i.deferUpdate();

                        if (i.customId === 'verification_code_next') {
                            var { body } = await snekfetch.get(`${config.firebaseURL}profile/${member}.json`)

                            if (body) {
                                var { data } = await snekfetch.get(`https://groups.roblox.com/v2/users/${body.RobloxId}/groups/roles`)

                                if (data.find(x => x.id === 14765837)){
                                    await interaction.member.roles.add(OrionRole);
                                }

                                interaction.member.setNickname(`${body.username}`);

                                return interaction.editReply({ embeds: [page3], components: [], ephemeral: true });
                            } else {
                                return interaction.editReply({ embeds: [page2], components: [row], ephemeral: true });
                            };
                        } else if (i.customId === 'verification_cancel') {
                            var { body } = await snekfetch.get(`${config.firebaseURL}pending/${userId}.json`)

                            if (body) {
                                firebase.database().ref(`pending/${userId}`).set({})
                            }

                            return interaction.editReply({ embeds: [page4], components: [], ephemeral: true });
                        };
                    });

                    collector.on('end', async i => {
                        var { body } = await snekfetch.get(`${config.firebaseURL}pending/${userId}.json`)

                        if (body) {
                            firebase.database().ref(`pending/${userId}`).set({})
                        }

                        return interaction.editReply({ embeds: [page5], components: [], ephemeral: true });
                    });
                });
            }
        }
    },
};