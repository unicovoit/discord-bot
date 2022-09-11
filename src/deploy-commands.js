import fs from 'node:fs';
import path from 'node:path';
import { REST } from '@discordjs/rest';
import discord_js from 'discord.js';
const { Client, Collection, GatewayIntentBits, Routes } = discord_js;
import { fileURLToPath } from 'url';

export const init = async () => {
    const GUILD_ID = "927943017468416030";
    const CLIENT_ID = "957274939398975499";
    const TOKEN = process.env.DISCORD_TOKEN;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const commands = [];
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        let command = await import(filePath)
        commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(TOKEN);

    rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
        .then(() => console.log(`Successfully registered ${commands.length} application commands.`))
        .catch(console.error);
}
