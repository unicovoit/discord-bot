import fs from 'node:fs';
import path from 'node:path';
import discord_js from 'discord.js';
import * as deploy from './deploy-commands.js';

deploy.init();

const {Client, Collection, GatewayIntentBits} = discord_js;

const GUILD_ID = "927943017468416030";
const CLIENT_ID = "957274939398975499";
const TOKEN = process.env.DISCORD_TOKEN;

import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({intents: [GatewayIntentBits.Guilds]});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    import(filePath).then(command => {
        client.commands.set(command.data.name, command);
    });
}

client.once('ready', () => {
    console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
    }
});

client.login(TOKEN);
