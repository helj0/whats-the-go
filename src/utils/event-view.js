// Builds the interactive "event detail" view: bonuses, trainer tip, and a
// Caught / Shiny caught button per featured species that reflects the
// current user's catch state and toggles it in place (interaction.update,
// not a new reply) — this is the click-through flow: /events -> tap an
// event -> tap Caught/Shiny on a species -> button updates immediately.

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getEvents } = require('../data/live-events');
const { eventStatus, formatRange, formatCountdown } = require('./event-helpers');
const { eventFeaturedSpecies } = require('./medals');
const { POKEMON } = require('../data/roster');
const { recommendItems } = require('./recommendations');
const { baseEmbed, typeColorInt } = require('./embeds');
const db = require('../db');

const MAX_SPECIES_ROWS = 4; // leaves 1 of Discord's 5-action-row cap for the Back button
const EMBED_FIELD_LIMIT = 1024; // Discord's hard cap on a single embed field's value

// Joins per-event lines into one field value, stopping before Discord's 1024-char
// field limit and noting how many got left off. The static 12-event seed data never
// hit this; the live ScrapedDuck feed can return 30+ events, so this is load-bearing now.
function buildEventListField(events, lineFn) {
  const lines = [];
  let used = 0;
  for (const ev of events) {
    const line = lineFn(ev);
    const addLen = line.length + (lines.length ? 2 : 0); // account for the '\n\n' join
    if (used + addLen > EMBED_FIELD_LIMIT - 40) break; // leave headroom for the "+N more" note
    lines.push(line);
    used += addLen;
  }
  let value = lines.join('\n\n');
  const remaining = events.length - lines.length;
  if (remaining > 0) value += `\n\n*+${remaining} more — use /raids or /spawns for current details*`;
  return value;
}

async function toggleEventCatch(userId, eventId, pokemonId, shiny) {
  const already = await db.hasCatch(userId, pokemonId, shiny, eventId);
  if (already) {
    await db.removeEventCatch(userId, pokemonId, shiny, eventId);
    return;
  }
  await db.addCatch(userId, pokemonId, { shiny, eventId });
  if (shiny) {
    // Catching the shiny always counts as catching the base too, if it isn't already logged.
    const baseAlready = await db.hasCatch(userId, pokemonId, false, eventId);
    if (!baseAlready) await db.addCatch(userId, pokemonId, { shiny: false, eventId });
  }
}

async function buildEventListView() {
  const events = getEvents();
  const live = events.filter(ev => eventStatus(ev) === 'live');
  const upcoming = events.filter(ev => eventStatus(ev) === 'upcoming');

  const embed = baseEmbed('🎉 Current Events');
  if (live.length === 0 && upcoming.length === 0) {
    embed.setDescription("Nothing on the calendar right now — check back soon!");
    return { embeds: [embed], components: [] };
  }
  if (live.length) {
    embed.addFields({
      name: '🟢 Live now — tap one below to open it',
      value: buildEventListField(live, ev => `**${ev.title}**\nEnds in ${formatCountdown(ev.end - Date.now())} \u00b7 ${formatRange(ev)}`),
    });
  }
  if (upcoming.length) {
    embed.addFields({
      name: '🔜 On deck',
      value: buildEventListField(upcoming, ev => `**${ev.title}**\nStarts in ${formatCountdown(ev.start - Date.now())} \u00b7 ${formatRange(ev)}`),
    });
  }
  if (live[0]) embed.setColor(typeColorInt(live[0].colorTypes && live[0].colorTypes.length ? live[0].colorTypes : ['normal']));

  // Only live events are interactable — nothing to catch or check off for something that hasn't started.
  const rows = [];
  for (const ev of live.slice(0, 5)) {
    rows.push(new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`ev:v:${ev.id}`).setLabel(ev.title.slice(0, 80)).setStyle(ButtonStyle.Primary)
    ));
  }
  return { embeds: [embed], components: rows };
}

async function buildEventDetailView(userId, eventId) {
  const ev = getEvents().find(e => e.id === eventId);
  if (!ev) return null;

  const st = eventStatus(ev);
  const embed = baseEmbed(`${st === 'live' ? '🟢' : '🔜'} ${ev.title}`)
    .setDescription(`${ev.summary}\n\n**Runs:** ${formatRange(ev)}`)
    .setColor(typeColorInt(ev.colorTypes && ev.colorTypes.length ? ev.colorTypes : ['normal']));

  if (ev.bonuses && ev.bonuses.length) {
    embed.addFields({ name: 'Bonuses', value: ev.bonuses.map(b => `${b.glyph} **${b.value}** \u2014 ${b.label}`).join('\n') });
  }
  const recs = recommendItems(ev);
  if (recs.length) embed.addFields({ name: '🎒 Worth using', value: recs.map(r => `${r.emoji} **${r.item}**`).join(', ') });
  if (ev.highlight) embed.addFields({ name: '💡 Trainer tip', value: ev.highlight });

  const species = eventFeaturedSpecies(ev);
  const rows = [];

  if (species.length > 0) {
    const statusLines = [];
    for (const id of species.slice(0, MAX_SPECIES_ROWS)) {
      const p = POKEMON[id];
      const baseCaught = await db.hasCatch(userId, id, false, ev.id);
      const shinyCaught = p.hasShiny ? await db.hasCatch(userId, id, true, ev.id) : false;

      statusLines.push(`${baseCaught ? '✅' : '⬜'} ${p.name}${p.hasShiny ? (shinyCaught ? ' \u2728\u2705' : ' \u2728') : ''}`);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`ev:c:${ev.id}:${id}:b`)
          .setLabel(`${p.name}${baseCaught ? ' \u2713 Caught' : ': Caught'}`.slice(0, 80))
          .setStyle(baseCaught ? ButtonStyle.Success : ButtonStyle.Secondary)
      );
      if (p.hasShiny) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`ev:c:${ev.id}:${id}:s`)
            .setLabel(shinyCaught ? '\u2728 Shiny \u2713' : '\u2728 Shiny caught')
            .setStyle(shinyCaught ? ButtonStyle.Success : ButtonStyle.Secondary)
        );
      }
      rows.push(row);
    }
    if (species.length > MAX_SPECIES_ROWS) {
      statusLines.push(`_...and ${species.length - MAX_SPECIES_ROWS} more \u2014 use \`/catch\` for those, too many to fit as buttons here._`);
    }
    embed.addFields({ name: 'Featured species', value: statusLines.join('\n') });
  }

  rows.push(new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ev:back').setLabel('\u2190 Back to Events').setStyle(ButtonStyle.Secondary)
  ));

  return { embeds: [embed], components: rows };
}

module.exports = { buildEventListView, buildEventDetailView, toggleEventCatch };
