const { getEvents } = require('../data/live-events');

function eventStatus(ev) {
  const now = Date.now();
  if (now < ev.start) return 'upcoming';
  if (now < ev.end) return 'live';
  return 'ended';
}

function liveEvents() { return getEvents().filter(ev => eventStatus(ev) === 'live'); }
function upcomingEvents() { return getEvents().filter(ev => eventStatus(ev) === 'upcoming'); }

// Discord renders <t:UNIX_SECONDS:STYLE> tags in each viewer's own local
// timezone and locale automatically, client-side \u2014 that's the only reliable
// way for a bot to show "the right" time per user, since Discord's API never
// exposes a user's timezone to bots. This replaces the old hand-formatted
// en-US strings, which rendered in whatever timezone the bot process itself
// happened to be running in (i.e. the same wall-clock time for every viewer
// regardless of where they actually are).
// Styles: t/T = short/long time, d/D = short/long date, f/F = short/long
// date+time, R = relative ("in 3 hours") \u2014 see Discord's timestamp docs.
function discordTimestamp(ms, style = 'f') {
  return `<t:${Math.floor(ms / 1000)}:${style}>`;
}

function formatRelative(ms) {
  return discordTimestamp(ms, 'R');
}

function formatRange(ev) {
  return `${discordTimestamp(ev.start, 'f')} \u2192 ${discordTimestamp(ev.end, 'f')}`;
}

function currentRaidBosses() {
  // dedup by pokemon id, keep the highest-weight (rarest) tier if it appears in multiple live events
  const byId = {};
  for (const ev of liveEvents()) {
    for (const rb of ev.raidBosses || []) {
      if (!byId[rb.id] || rb.weight > byId[rb.id].weight) {
        byId[rb.id] = { ...rb, eventTitle: ev.title, eventId: ev.id };
      }
    }
  }
  return Object.values(byId).sort((a, b) => b.weight - a.weight);
}

function currentWildSpawns() {
  const byId = {};
  for (const ev of liveEvents()) {
    for (const id of ev.wildSpawns || []) {
      if (!byId[id]) byId[id] = { id, eventTitle: ev.title, eventId: ev.id };
    }
  }
  return Object.values(byId);
}

module.exports = { eventStatus, liveEvents, upcomingEvents, discordTimestamp, formatRelative, formatRange, currentRaidBosses, currentWildSpawns };
