const { Client, Collection } = require('discord.js');
const { readdirSync } = require('fs');
const config = require('/config.json')
const firebase = require('firebase')
const firebaseConfig = {
    databaseURL: `${config.firebaseURL}`,
};
firebase.initializeApp(firebaseConfig)

const discordClient = Client.new({
    intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_BANS', 'GUILD_EMOJIS_AND_STICKERS', 'GUILD_INTEGRATIONS', 'GUILD_WEBHOOKS', 'GUILD_VOICE_STATES', 'GUILD_PRESENCES', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MESSAGE_TYPING', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'DIRECT_MESSAGE_TYPING'],
    partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION']
});

discordClient.commands = new Collection();
const commands = readdirSync("./commands/").filter(file => file.endsWith(".js"));

for (const file of commands) {
    try {
        const props = require(`./commands/${file}`);
        discordClient.commands.set(props.name, props);
    } catch (e) {
        console.error(`Unable to load command ${file}: ${e}`);
    }
}

discordClient.once('ready', () => {
    discordClient.user.setActivity('ORION CORE', { type: 'WATCHING' });

    let slashCommands

    slashCommands = discordClient.application?.commands

    for (const file of commands) {
        const command = require(`./commands/${file}`);
        
        slashCommands?.create({
            name: command.data.name,
            description: command.data.description,
            options: command.data.options?,
            default_member_permissions: command.data.default_member_permissions?,
        })
        
        console.log(`\n // Pushed ${command.data.name}. //`)
    }
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

discordClient.login(config.botToken)