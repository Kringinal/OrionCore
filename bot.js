const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { readdirSync } = require('fs');
const express = require('express');
const config = require('./config.json')
const firebase = require('firebase-admin')
const cron = require('node-cron');
const app = express();
const serviceAccount = require('./orion-core-61636-firebase-adminsdk-4c2ck-a996d6a61a.json')
const firebaseConfig = {
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: `${config.firebaseURL}`,
};
const loggedIn = false
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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', index);
app.use('/api', api);

app.listen(process.env.PORT || 5000, () => {
  console.log('listening');
});

function rblx_login() {
    rblxFunctions.setCookie(process.env.COOKIE).then(function() {
      loggedIn = true
      console.log("logged in to Roblox");
    })
      .catch(function(error) {
        console.log("There was an error when attempting to log in to roblox. " + error)
      })
  
  }

cron.schedule('* * 1 * *', () => {
    if (loggedIn == true) {
      loggedIn = false
      rblxFunctions.refreshCookie().then(function(newCookie) {
        process.env.COOKIE = newCookie
        rblx_login();
        console.log("Cookie refreshed, validated and relogged in.")
      })
    }
  });

cron.schedule('*/25 * * * *', () => {
  axios.get('https://orioncore-7d170ec55711.herokuapp.com/api/');
})

discordClient.login(process.env.DISTOKEN)
rblx_login()

module.exports = app;
