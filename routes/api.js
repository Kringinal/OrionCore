const { Client, Attachment, EmbedBuilder } = require('discord.js')
const config = require('../config.json');
let express = require('express');
let axios = require('axios').default;
let router = express.Router();
const rblxFunctions = require("noblox.js");
const logPromotion = require('../utils/pointlog.js')
const firebase = require('firebase-admin');
let db = firebase.database();
let client;

const gamesUrl = "https://games.roblox.com/v1/games/multiget-place-details?placeIds="

const headerData = {
      "x-api-key": "Re7DxNU51Ui89JvoXKFoNtgHNpksWva6bqbm9/yswXZ4F11y",
    };

/* GET SPECIFIC USER FROM BLACKLIST */
module.exports.setclient = function(newclient){
    client = newclient
}

router.get('/getnextrole/:userid', async (req, res, next) => {
  try {
    
    const OldRank = await rblxFunctions.getRankInGroup(14765837, req.params.userid)
    const GroupRanks = await rblxFunctions.getRoles(14765837)
    let OldRankName = "TEST"
    let NextRank = "TEST"
    
    for (let i=0; i < GroupRanks.length; i++) {
        if (GroupRanks[i].rank == OldRank || GroupRanks[i].id == OldRank){
          if (GroupRanks[i+1] == null){
            NextRank = "Builderman"
            OldRankName = GroupRanks[i].name
          } else {
            NextRank = GroupRanks[i+1].name
            OldRankName = GroupRanks[i].name
          }
        }
    }
      res.status(201).json({
          oldrank: OldRankName,
          newrank: NextRank
      });
      return
    } catch (er) {
        res.status(400).json({
            error: er
        });
        return
    }
}),
    
router.get('/gameinfo/:id', async (req, res, next) => {
    try {
    
    const Response = await rblxFunctions.getThumbnails([
          {
               type: "GameThumbnail",
               targetId: req.body.id,
               format: "png",
               size: "768x432"
        }
    ])
    console.log(Response)
        
      res.status(201).json({
          return: Response
      });
      return
    } catch (er) {
        res.status(400).json({
            error: er
        });
        return
    }
}),

/* ACCEPTING USER */
router.post('/accept', async (req, res, next) =>{
    const UserId = req.body.userid
    const Username = req.body.username

    const request = await rblxFunctions.getJoinRequest(14765837, UserId)

    if (request) {
        try {
            rblxFunctions.handleJoinRequest(14765837, UserId, true)
            logPromotion.logAccpetance(UserId)
            res.status(201).json({
                message: 'Accepted User!',
              });
            return
        } catch {
	    const embed = new EmbedBuilder()
            .setTitle(`**COULD NOT ACCEPT**`)
            .setDescription(`The user, [${Username}](https://www.roblox.com/users/${UserId}/profile), needs accepted into Orion Core as the bot has failed to do so.`)
            .setTimestamp()
            .setColor(config.ErrorColor)       
            .setThumbnail(config.GroupLogo)
        
            const channel = client.channels.cache.find(ch => ch.name == "📝┊orion_logs")
            channel.send({ embeds: [embed] })
            res.status(400).json({
                error: 'Could not accept user!'
            });
            return
        }
    } else {
	const embed = new EmbedBuilder()
            .setTitle(`**COULD NOT ACCEPT**`)
            .setDescription(`The user, [${Username}](https://www.roblox.com/users/${UserId}/profile), needs accepted into Orion Core as the bot has failed to do so.`)
            .setTimestamp()
            .setColor(config.ErrorColor)       
            .setThumbnail(config.GroupLogo)

	     const channel = client.channels.cache.find(ch => ch.name == "📝┊orion_logs")
	    channel.send({ embeds: [embed] })
        res.status(400).json({
            error: 'User is not pending!'
        });
        return
    }
})

/* Adding Marks */
router.post('/editmarks', async (req, res, next) =>{
    const UserId = req.body.userid
    const timestamp = req.body.timestamp
    const Host = req.body.hostid
    const MarksAmount = req.body.marks
    const EventType = req.body.type
	
    var Profile = await axios.get(`${config.firebaseURL}Profiles/${UserId}_Info.json`)
	
      if (Profile.data) {
	    var marks = Profile.data.Marks
	    var logs = Profile.data.Logs
	    var Lastupdated = Profile.data.LastUpdated
	    var Discordid = Profile.data.DiscordId
	    var Robloxid = Profile.data.RobloxId

	    console.log(logs)
	    logs[logs.length] = {
	      DateTime: timestamp,
	      HostId: Host,
	      Marks: MarksAmount,
	      Type: EventType
	   }

	  db.ref(`Profiles/${UserId}_Info/`).set({
	      Marks: marks + MarksAmount,
	      Logs: logs,
	      LastUpdated: timestamp,
	      RobloxId: Robloxid,
	      DiscordId:  Discordid
	  })

	   res.status(201).json({
	    message: 'Edited Marks!',
	  });
	    
	  const CurrRank = await rblxFunctions.getRankInGroup(14765837, Robloxid)
	  const Requirements = await axios.get(`${config.firebaseURL}Requirements.json`)
	  const UserNameResponse = await axios.get(`https://users.roblox.com/v1/users/` + Robloxid)

	  if (Requirements.data[CurrRank+1] !== null) {
		if (marks + MarksAmount >= Requirements.data[CurrRank+1]) {			     
			axios({
			     method: 'post',
			     url: `https://orioncore-3b6068b75ef5.herokuapp.com/api/promote`,
			     headers: {'Content-Type': 'application/json',}, 
			     data: {
			       userid: Robloxid,
			       username: UserNameResponse.data.name,
			     }
			});
		   }
	      }
      }
})
  
/* PROMOTE USER */
router.post('/promote', async (req, res, next) => {
  const userid = req.body.userid
  const username = req.body.username
  
  try {
    
    const OldRank = await rblxFunctions.getRankInGroup(14765837, userid)
    const GroupRanks = await rblxFunctions.getRoles(14765837)
    let CurrentRank = "TEST"
    let NextRank = "TEST"
    
    if (OldRank >= 12){
      const embed = new EmbedBuilder()
    .setTitle(`**COULD NOT PROMOTE**`)
    .setDescription(`The user, [${username}](https://www.roblox.com/users/${userid}/profile), needs Promoted in Orion Core as the bot has failed to do so.`)
    .setTimestamp()
    .setColor(config.ErrorColor)       
    .setThumbnail(config.GroupLogo)

    const channel = client.channels.cache.find(ch => ch.name == "📝┊orion_logs")
    channel.send({ embeds: [embed] })
      res.status(201).json({
        message: 'Cannot Promote user.',
      });
      return
    }
    
    for (let i=0; i < GroupRanks.length; i++) {
        if (GroupRanks[i].rank == OldRank || GroupRanks[i].id == OldRank){
           NextRank = GroupRanks[i+1].name,
           CurrentRank = GroupRanks[i].name
        }
    }

    await rblxFunctions.changeRank(14765837, userid, 1)
    
    console.log(userid, CurrentRank, NextRank)
    
    logPromotion.logpromotion(userid, CurrentRank, NextRank)
      
    res.status(201).json({
      message: 'Promoted user.',
    });
  } catch (er) {
    console.log("Promotional Error: " + er)
    res.status(400).json({
      error: 'Request needs to contain a Username.'
    });
    return
  }
}),


module.exports = router;
