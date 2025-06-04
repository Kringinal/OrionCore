const { Client, Attachment, EmbedBuilder } = require('discord.js')
const config = require('../config.json');
let express = require('express');
let axios = require('axios').default;
let router = express.Router();
const firebase = require('firebase-admin');
let db = firebase.database();
let client;

module.exports.setclient = function(newclient){
    client = newclient
}
    
router.get('/gameinfo/:id', async (req, res, next) => {
    console.log('test')
}),


module.exports = router;
