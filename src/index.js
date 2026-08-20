require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, MessageFlags } = require('discord.js');

const db = require('./db');
const { startScheduler } = require('./scheduler');
const { startLiveEventsRefresh } = require('./data/live-events');
const { POKEMON } = require('./data/roster');
const { buildCountersEmbed } = require('./commands/counters');
const { buildEventListView, buildUpcomingListView, buildEventDetailView, toggleEventCatch } = require('./utils/event-view');

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
      const parts = interaction.customId.split(':');
      const [ns, action] = parts;

      if (ns === 'counters') {
        // legacy 2-part id from /raids quick-jump buttons: counters:<pokemonId>
        const target = POKEMON[action];
        if (!target) return interaction.reply({ content: 'Species not found.', flags: MessageFlags.Ephemeral });
        await interaction.reply({ embeds: [buildCountersEmbed(target)] });
        return;
      }

      if (ns === 'ev') {
        // /events messages are public (not ephemeral), so anyone in the channel can see
        // and click these buttons. Without this check, a second user clicking one would
        // toggle *their own* catch data (that part was always safe — see db.js, every
        // query is scoped by the clicker's own user id) but would also re-render the
        // shared message using their catch state, making it look to the original user
        // like their progress had changed when it hadn't. Restrict clicks to whoever
        // originally ran /events. interaction.update() edits the message in place rather
        // than recreating it, so interactionMetadata keeps pointing at that original
        // /events invocation across the whole list -> detail -> back navigation flow.
        const ownerId = interaction.message.interactionMetadata?.user?.id
          ?? interaction.message.interaction?.user?.id; // fallback for older cached messages
        if (ownerId && ownerId !== interaction.user.id) {
          return interaction.reply({ content: 'This isn’t your menu — run `/events` yourself to get your own.', flags: MessageFlags.Ephemeral });
        }

        if (action === 'back') {
          const view = await buildEventListView();
          await interaction.update(view);
          return;
        }
        if (action === 'upcoming') {
          const view = await buildUpcomingListView();
          await interaction.update(view);
          return;
        }
        if (action === 'v') {
          const [, , eventId, page] = parts;
          const view = await buildEventDetailView(interaction.user.id, eventId, page ? parseInt(page, 10) : 0);
          if (!view) return interaction.reply({ content: 'That event isn\u2019t live anymore.', flags: MessageFlags.Ephemeral });
          await interaction.update(view);
          return;
        }
        if (action === 'c') {
          const [, , eventId, pokemonId, kind, page] = parts;
          await toggleEventCatch(interaction.user.id, eventId, pokemonId, kind === 's');
          const view = await buildEventDetailView(interaction.user.id, eventId, page ? parseInt(page, 10) : 0);
          if (!view) return interaction.reply({ content: 'That event isn\u2019t live anymore.', flags: MessageFlags.Ephemeral });
          await interaction.update(view);
          return;
        }
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
