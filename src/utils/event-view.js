// Builds the interactive "event detail" view: bonuses, trainer tip, and a
// Caught / Shiny caught button per featured species that reflects the
// current user's catch state and toggles it in place (interaction.update,
// not a new reply) — this is the click-through flow: /events -> tap an
// event -> tap Caught/Shiny on a species -> button updates immediately.

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getEvents } = require('../data/live-events');
const { eventStatus, formatRange, formatRelative } = require('./event-helpers');
const { eventFeaturedSpecies } = require('./medals');
const { POKEMON } = require('../data/roster');
const { recommendItems } = require('./recommendations');
const { baseEmbed, typeColorInt, addListField } = require('./embeds');
const db = require('../db');

const MAX_SPECIES_ROWS = 4; // leaves 1 of Discord's 5-action-row cap for the Back button
const MAX_LIVE_EVENT_ROWS = 4; // leaves 1 of Discord's 5-action-row cap for the "See upcoming" button

async function toggleEventCatch(userId, eventId, pokemonId, shiny) {
  // Base and shiny are toggled fully independently — catching the shiny no longer
  // auto-logs the base catch. (Previously it did; changed at the user's request.)
  const already = await db.hasCatch(userId, pokemonId, shiny, eventId);
  if (already) {
    await db.removeEventCatch(userId, pokemonId, shiny, eventId);
    return;
  }
  await db.addCatch(userId, pokemonId, { shiny, eventId });
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
    const entries = live.map(ev => '**' + ev.title + '**\nEnds ' + formatRelative(ev.end) + ' \u00b7 ' + formatRange(ev));
    addListField(embed, '🟢 Live now — tap one below to open it', entries);
  } else {
    embed.setDescription("Nothing live right now — check what's coming up below.");
  }
  if (live[0]) embed.setColor(typeColorInt(live[0].colorTypes && live[0].colorTypes.length ? live[0].colorTypes : ['normal']));

  // Only live events are interactable — nothing to catch or check off for something that hasn't started.
  const rows = [];
  for (const ev of live.slice(0, MAX_LIVE_EVENT_ROWS)) {
    rows.push(new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`ev:v:${ev.id}`).setLabel(ev.title.slice(0, 80)).setStyle(ButtonStyle.Primary)
    ));
  }
  if (upcoming.length) {
    rows.push(new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ev:upcoming').setLabel(`🔜 See upcoming events (${upcoming.length})`).setStyle(ButtonStyle.Secondary)
    ));
  }
  return { embeds: [embed], components: rows };
}

async function buildUpcomingListView() {
  const events = getEvents();
  const upcoming = events.filter(ev => eventStatus(ev) === 'upcoming');

  const embed = baseEmbed('🔜 Upcoming Events');
  if (upcoming.length === 0) {
    embed.setDescription('Nothing upcoming on the calendar right now — check back soon!');
  } else {
    const entries = upcoming.map(ev => '**' + ev.title + '**\nStarts ' + formatRelative(ev.start) + ' \u00b7 ' + formatRange(ev));
    addListField(embed, '🔜 On deck', entries);
  }

  // Upcoming events aren't interactable — nothing to catch or check off for something
  // that hasn't started — so this view is just the list plus a way back.
  const rows = [new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ev:back').setLabel('\u2190 Back to Events').setStyle(ButtonStyle.Secondary)
  )];
  return { embeds: [embed], components: rows };
}

async function buildEventDetailView(userId, eventId, page = 0) {
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
  const totalPages = Math.max(1, Math.ceil(species.length / MAX_SPECIES_ROWS));
  const safePage = Math.min(Math.max(page, 0), totalPages - 1);
  const start = safePage * MAX_SPECIES_ROWS;
  const pageSpecies = species.slice(start, start + MAX_SPECIES_ROWS);

  if (species.length > 0) {
    const statusLines = [];
    for (const id of pageSpecies) {
      const p = POKEMON[id];
      const baseCaught = await db.hasCatch(userId, id, false, ev.id);
      const shinyCaught = p.hasShiny ? await db.hasCatch(userId, id, true, ev.id) : false;

      statusLines.push(`${baseCaught ? '\u2705' : '\u2b1c'} ${p.name}${p.hasShiny ? (shinyCaught ? ' \u2728\u2705' : ' \u2728') : ''}`);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`ev:c:${ev.id}:${id}:b:${safePage}`)
          .setLabel(`${p.name}${baseCaught ? ' \u2713 Caught' : ': Caught'}`.slice(0, 80))
          .setStyle(baseCaught ? ButtonStyle.Success : ButtonStyle.Secondary)
      );
      if (p.hasShiny) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`ev:c:${ev.id}:${id}:s:${safePage}`)
            .setLabel(shinyCaught ? '\u2728 Shiny \u2713' : '\u2728 Shiny caught')
            .setStyle(shinyCaught ? ButtonStyle.Success : ButtonStyle.Secondary)
        );
      }
      rows.push(row);
    }
    const fieldName = totalPages > 1 ? `Featured species (page ${safePage + 1}/${totalPages})` : 'Featured species';
    embed.addFields({ name: fieldName, value: statusLines.join('\n') });
  }

  // Pagination + Back always share one final row rather than eating a whole row each —
  // species rows are capped at MAX_SPECIES_ROWS (4) so this always fits Discord's 5-row cap.
  const navRow = new ActionRowBuilder();
  if (safePage > 0) {
    navRow.addComponents(
      new ButtonBuilder().setCustomId(`ev:v:${ev.id}:${safePage - 1}`).setLabel('\u25c0 Previous').setStyle(ButtonStyle.Secondary)
    );
  }
  if (safePage < totalPages - 1) {
    const remaining = species.length - (start + pageSpecies.length);
    navRow.addComponents(
      new ButtonBuilder().setCustomId(`ev:v:${ev.id}:${safePage + 1}`).setLabel(`Show more (${remaining} left) \u25b6`).setStyle(ButtonStyle.Secondary)
    );
  }
  navRow.addComponents(
    new ButtonBuilder().setCustomId('ev:back').setLabel('\u2190 Back to Events').setStyle(ButtonStyle.Secondary)
  );
  rows.push(navRow);

  return { embeds: [embed], components: rows };
}

module.exports = { buildEventListView, buildUpcomingListView, buildEventDetailView, toggleEventCatch };
