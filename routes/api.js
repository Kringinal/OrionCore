const { Attachment } = require('discord.js')
let express = require('express');
let axios = require('axios').default;
let router = express.Router();
const rblxFunctions = require("noblox.js");
const logPromotion = require('../utils/pointlog.js')
let client;

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

const gamesUrl = "https://games.roblox.com/v1/games/multiget-place-details?placeIds="
    
router.get('/gameinfo/:id', async (req, res, next) => {
    try {
    
    const Response = await axios.get(gamesUrl + req.params.id)
    console.log(Response)
        
      res.status(201).json({
          return: Response.data
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
            res.status(400).json({
                error: 'Could not accept user!'
            });
            return
        }
    } else {
        res.status(400).json({
            error: 'User is not pending!'
        });
        return
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
