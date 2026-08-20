// Polls every few minutes for events that just went live and haven't been
// announced to a given guild yet, and posts an announcement embed to that
// guild's configured channel. Each guild only gets a given event announced
// once (tracked in guild_settings.announced_event_ids).

const { getEvents } = require('./data/live-events');
const { eventStatus, formatRange } = require('./utils/event-helpers');
const { recommendItems } = require('./utils/recommendations');
const { baseEmbed, typeColorInt } = require('./utils/embeds');
const db = require('./db');

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

function buildAnnouncementEmbed(ev) {
  const embed = baseEmbed(`🎉 Now live: ${ev.title}`)
    .setDescription(`${ev.summary}\n\n**Runs:** ${formatRange(ev)}`)
    .setColor(typeColorInt(ev.colorTypes && ev.colorTypes.length ? ev.colorTypes : ['normal']));

  if (ev.bonuses && ev.bonuses.length) {
    embed.addFields({ name: 'Bonuses', value: ev.bonuses.map(b => `${b.glyph} **${b.value}** \u2014 ${b.label}`).join('\n') });
  }
  const recs = recommendItems(ev);
  if (recs.length) {
    embed.addFields({ name: '🎒 Worth using', value: recs.map(r => `${r.emoji} **${r.item}**`).join(', ') });
  }
  if (ev.highlight) {
    embed.addFields({ name: '💡 Trainer tip', value: ev.highlight });
  }
  return embed;
}

async function checkAndAnnounce(client) {
  const liveNow = getEvents().filter(ev => eventStatus(ev) === 'live');
  if (liveNow.length === 0) return;

  let guildConfigs;
  try {
    guildConfigs = await db.getAllGuildSettingsWithChannel();
  } catch (err) {
    console.error('[scheduler] failed to load guild settings:', err.message);
    return;
  }

  for (const cfg of guildConfigs) {
    const announced = new Set(cfg.announced_event_ids || []);
    const toAnnounce = liveNow.filter(ev => !announced.has(ev.id));
    if (toAnnounce.length === 0) continue;

    const channel = await client.channels.fetch(cfg.event_channel_id).catch(() => null);
    if (!channel) continue;

    for (const ev of toAnnounce) {
      try {
        await channel.send({ embeds: [buildAnnouncementEmbed(ev)] });
        await db.markEventAnnounced(cfg.guild_id, ev.id);
      } catch (err) {
        console.error(`[scheduler] failed to announce ${ev.id} in guild ${cfg.guild_id}:`, err.message);
      }
    }
  }
}

function startScheduler(client) {
  checkAndAnnounce(client).catch(err => console.error('[scheduler] boot check failed:', err.message)); // run once at boot
  setInterval(() => {
    checkAndAnnounce(client).catch(err => console.error('[scheduler] poll failed:', err.message));
  }, POLL_INTERVAL_MS);
  console.log(`[scheduler] polling every ${POLL_INTERVAL_MS / 60000} minutes`);
}

module.exports = { startScheduler, buildAnnouncementEmbed };
