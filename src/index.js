require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, MessageFlags } = require('discord.js');

const db = require('./db');
const { startScheduler } = require('./scheduler');
const { startLiveEventsRefresh } = require('./data/live-events');
const { POKEMON } = require('./data/roster');
const { buildCountersEmbed } = require('./commands/counters');

// Process-level safety nets — one bad promise rejection anywhere (including
// in the scheduler's background loop, which isn't covered by the
// interactionCreate try/catch below) shouldn't take the whole bot down.
process.on('unhandledRejection', (err) => {
  console.error('[bot] unhandled rejection:', err);
});
process.on('uncaughtException', (err) => {
  console.error('[bot] uncaught exception:', err);
});

const { DISCORD_TOKEN } = process.env;
if (!DISCORD_TOKEN) {
  console.error('Missing DISCORD_TOKEN in your environment.');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandsDir = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'))) {
  const command = require(path.join(commandsDir, file));
  if (command.data) client.commands.set(command.data.name, command);
}

client.on('error', (err) => console.error('[bot] client error:', err));

client.once('ready', async () => {
  console.log(`[bot] logged in as ${client.user.tag}, in ${client.guilds.cache.size} guild(s)`);
  try {
    await db.initDb();
  } catch (err) {
    console.error('[bot] database init failed — commands that touch the DB will error until this is fixed:', err.message);
  }
  startLiveEventsRefresh();
  startScheduler(client);
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
      return;
    }

    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (!command || !command.autocomplete) return;
      await command.autocomplete(interaction);
      return;
    }

    if (interaction.isButton()) {
      const [action, payload] = interaction.customId.split(':');
      if (action === 'counters') {
        const target = POKEMON[payload];
        if (!target) return interaction.reply({ content: 'Species not found.', flags: MessageFlags.Ephemeral });
        await interaction.reply({ embeds: [buildCountersEmbed(target)] });
      }
      return;
    }
  } catch (err) {
    console.error('[bot] interaction error:', err);
    const payload = { content: 'Something went wrong handling that \u2014 try again in a moment.', flags: MessageFlags.Ephemeral };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(payload).catch(() => {});
    } else if (interaction.isRepliable && interaction.isRepliable()) {
      await interaction.reply(payload).catch(() => {});
    }
  }
});

client.login(DISCORD_TOKEN);
