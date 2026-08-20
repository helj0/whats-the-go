// Registers all slash commands with Discord globally (can take up to ~1hr to
// propagate the first time; subsequent changes are usually near-instant).
// Run this once after adding/changing a command:
//     node src/deploy-commands.js

require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsDir = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'))) {
  const command = require(path.join(commandsDir, file));
  if (command.data) commands.push(command.data.toJSON());
}

const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = process.env;
if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  console.error('Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in your environment (.env locally, or Railway variables).');
  process.exit(1);
}

const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
  console.log(`Registering ${commands.length} global slash commands...`);
  const data = await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: commands });
  console.log(`Done — registered ${data.length} commands:`, data.map(c => c.name).join(', '));
})().catch(err => {
  console.error('Failed to register commands:', err);
  process.exit(1);
});
