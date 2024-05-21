const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios  = require('axios').default;
const { readdirSync } = require('fs');
const express = require('express');
const config = require('./config.json')
const firebase = require('firebase-admin')
const cron = require('node-cron');
const app = express();
const rblxFunctions = require("noblox.js");
const serviceAccount = require('./orion-core-61636-firebase-adminsdk-4c2ck-a996d6a61a.json')
const firebaseConfig = {
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: `${config.firebaseURL}`,
};
var loggedIn = false
firebase.initializeApp(firebaseConfig)


var currentcommands = []

const discordClient = new Client({ intents: [GatewayIntentBits.Guilds] });

discordClient.commands = new Collection();
const commands = readdirSync("./commands/").filter(file => file.endsWith(".js"));

function registerCommands({ commandss }) {
    console.log(commandss)
    discordClient.application.commands.set(commandss);
   }

discordClient.once('ready', () => {
    //discordClient.user.setActivity('ORION CORE', { type: 'WATCHING' });

    for (const file of commands) {
        const command = require(`./commands/${file}`);
        currentcommands.push(command.data);
        discordClient.commands.set(command.data.name, command);
        console.log(`\n // Pushed ${command.data.name}. //`)
    }
    
    (async () => {
        try {
            console.log('Started refreshing application (/) commands.');
    
            await  registerCommands({commandss: currentcommands}) //guildId: 688594405266948116 
    
            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    })();
});

discordClient.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
        const { commandName } = interaction
        const command = discordClient.commands.get(commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);

            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

let index = require('./routes/index');
let api = require('./routes/api');
let Logger = require('./utils/pointlog.js')

Logger.registerclient(discordClient)

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', index);
app.use('/api', api);

app.listen(process.env.PORT || 5000, () => {
  console.log('listening');
});

async function rblx_login() {
     var Cookie = await axios.get(`${config.firebaseURL}CookieInfo.json`)
    console.log("cookie Data" + Cookie.data.Cookie)
    if (Cookie.data) {
        rblxFunctions.setCookie(Cookie.data.Cookie).then(function() {
            loggedIn = true
            console.log("logged in to Roblox");
             const embed = new EmbedBuilder()
            .setTitle(`**LOGGED  IN**`)
            .setDescription(`Successfully logged in under the account, [Orion_Automation](https://www.roblox.com/users/4791296289/profile)`)
            .setTimestamp()
            .setColor(`#8CFF00`)       
            .setThumbnail(config.GroupLogo)
            
            const channel = await discordClient.channels.cache.find(ch => ch.name == "📝┊orion_logs")
            channel.send({ embeds: [embed] })
        })
        .catch(function(error) {
            console.log("There was an error when attempting to log in to roblox. " + error)

            const embed = new EmbedBuilder()
            .setTitle(`**FAILED TO LOG IN**`)
            .setDescription(`Failed to log into [Orion_Automation](https://www.roblox.com/users/4791296289/profile).`)
            .setTimestamp()
            .setColor(config.ErrorColor)       
            .setThumbnail(config.GroupLogo)
        
            const channel = await discordClient.channels.cache.find(ch => ch.name == "📝┊orion_logs")
            channel.send({ embeds: [embed] })
        })
    }
  }

cron.schedule('*/30 * * * *', () => {
    if (loggedIn == true) {
      loggedIn = false
      rblxFunctions.refreshCookie().then(function(newCookie) {
          firebase.database().ref(`CookieInfo/Cookie`).set(newCookie)
        rblx_login();
        console.log("Cookie refreshed, validated and relogged in.")
      })
    }
  });

cron.schedule('* * * * *', () => {
  axios.get('https://orioncore-3b6068b75ef5.herokuapp.com/');
})

discordClient.login(process.env.DISTOKEN)
rblx_login()

module.exports = app;
