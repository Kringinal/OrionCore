const config = require('../config.json');

const { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const axios  = require('axios').default;
const firebase = require('firebase-admin');
let db = firebase.database();

module.exports = {
    data: new SlashCommandBuilder()
    .setName('banlist')
    .setDescription('add/remove from the Arvorian Banlist.')
    .addStringOption((option) =>
        option.setName('addorremove')
	    .setDescription('Choose whether you want to add/remove from the banlist.')
	    .setRequired(true)
	    .addChoices(
		{ name: 'Add', value: 'add' },
		{ name: 'Remove', value: 'remove' },
	    )
    )
    .addStringOption((option) =>
        option.setName('type')
	    .setDescription('Group or user')
        .setRequired(true)
        .addChoices(
        { name: 'Group', value: 'group' },
        { name: 'User', value: 'user' },
        )
    )
    .addStringOption((option) =>
        option.setName('id')
            .setDescription('Enter the userid or groupid.')
            .setRequired(true)
    )

    .addStringOption((option) =>
        option.setName('reason')
            .setDescription('Enter the reason for the ban.')
            .setRequired(true)
    ),


    async execute(interaction) {
        var HostUserID = interaction.member.user.id

	    var MessageResponse = interaction.reply({ content: `Processing Command...`});
	    
        const { options } = interaction

        const addremovechoice = options.getString('addorremove');
        const type = options.getString('type')
        const id = options.getString('id')
        const reason = options.getString('reason')

        if (addremovechoice == 'remove' && type == 'user') {
            var Profile = await axios.get(`${config.firebaseURL}User_Banlist/${id}_User`)

            if (Profile !== null){
               await firebase.database().ref(`User_Banlist/${id}_User`).set({})

                const EEmbed = new EmbedBuilder()
                    .setTitle('SUCCESS')
                    .setDescription(`${id} HAS BEEN REMOVED FROM THE BANLIST`)
                    .setColor(0x5d65f3)
                    .setTimestamp()
		        interaction.channel.send({content: "", embeds: [EEmbed]})
            } else {
                const EEmbed = new EmbedBuilder()
                    .setTitle('ERROR')
                    .setDescription(`${id} IS NOT ON THE BANLIST`)
                    .setColor(config.ErrorColor)
                    .setTimestamp()
		        interaction.channel.send({content: "", embeds: [EEmbed]})
            }
	    
        } else if (addremovechoice == 'add' && type == 'user') {
             var Profile = await axios.get(`${config.firebaseURL}User_Banlist/${id}_User`)

            if (Profile === null){
                await firebase.database().ref(`User_Banlist/${id}_User`).set({Reason: reason})

                const EEmbed = new EmbedBuilder()
                    .setTitle('SUCCESS')
                    .setDescription(`${id} HAS BEEN ADDED TO THE BANLIST`)
                    .setColor(0x5d65f3)
                    .setTimestamp()
		        interaction.channel.send({content: "", embeds: [EEmbed]})
            } else {
                const EEmbed = new EmbedBuilder()
                    .setTitle('ERROR')
                    .setDescription(`${id} IS ALREADY ON THE BANLIST`)
                    .setColor(config.ErrorColor)
                    .setTimestamp()
		        interaction.channel.send({content: "", embeds: [EEmbed]})
            }
        }


        if (addremovechoice == 'remove' && type == 'group') {
             var Profile = await axios.get(`${config.firebaseURL}Group_Banlist/0_List/${id}_Group`)

            if (Profile !== null){
                await firebase.database().ref(`Group_Banlist/0_List/${id}_Group`).set({})

                const EEmbed = new EmbedBuilder()
                    .setTitle('SUCCESS')
                    .setDescription(`${id} HAS BEEN REMOVED FROM THE BANLIST`)
                    .setColor(0x5d65f3)
                    .setTimestamp()
		        interaction.channel.send({content: "", embeds: [EEmbed]})
            } else {
                const EEmbed = new EmbedBuilder()
                    .setTitle('ERROR')
                    .setDescription(`${id} IS NOT ON THE BANLIST`)
                    .setColor(config.ErrorColor)
                    .setTimestamp()
		        interaction.channel.send({content: "", embeds: [EEmbed]})
            }
        } else if (addremovechoice == 'add' && type == 'group') {
            var Profile = await axios.get(`${config.firebaseURL}Group_Banlist/0_List/${id}_Group`)

            if (Profile == null) {
                 await firebase.database().ref(`Group_Banlist/0_List/${id}_Group`).set({Reason: reason})

                 const EEmbed = new EmbedBuilder()
                    .setTitle('SUCCESS')
                    .setDescription(`${id} HAS BEEN ADDED TO THE BANLIST`)
                    .setColor(0x5d65f3)
                    .setTimestamp()
		        interaction.channel.send({content: "", embeds: [EEmbed]})
            } else {
                const EEmbed = new EmbedBuilder()
                    .setTitle('ERROR')
                    .setDescription(`${id} IS ALREADY ON THE BANLIST`)
                    .setColor(config.ErrorColor)
                    .setTimestamp()
		        interaction.channel.send({content: "", embeds: [EEmbed]})
            }
        }
    },
};