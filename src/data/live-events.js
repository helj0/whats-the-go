// Fetches live Pokémon GO event data from ScrapedDuck (bigfoott/ScrapedDuck),
// which scrapes LeekDuck.com on a schedule and publishes JSON on request.
// Per ScrapedDuck's usage terms: this bot is free, ad-free, and credits
// LeekDuck.com + ScrapedDuck everywhere event data is shown — keep it that way.
//
// ============================== IMPORTANT ==============================
// The endpoint URL and the TYPE_MAP / transformEvent() field-name guesses
// below are based on cross-referenced *documentation of other tools* that
// consume this feed (PoGOEvents, go-calendar, MMM-PokemonGOEvents) — the
// environment this file was written in could not reach the live internet
// to fetch-and-verify the real JSON shape directly. This is a best-effort
// integration, not a confirmed one.
//
// BEFORE RELYING ON THIS IN PRODUCTION:
//   node -e "require('./src/data/live-events').refreshEvents().then(() => console.log(require('./src/data/live-events').getStatus()))"
// and check `lastFetchOk`. If it's false, or events come back with empty
// bonuses/raidBosses/wildSpawns arrays where you'd expect data, log the raw
// response (temporarily add `console.log(JSON.stringify(raw[0], null, 2))`
// in refreshEvents()) and fix the field paths in transformEvent() to match
// reality. Until confirmed, the bot silently runs on the static fallback
// data in ./events.js whenever the live fetch fails or looks malformed —
// so it stays functional either way, but "fresh" isn't guaranteed until
// someone verifies this against the real feed.
// =========================================================================

const https = require('https');
const { EVENTS: FALLBACK_EVENTS } = require('./events');
const { findByName } = require('./roster');
const { EVENT_SPAWN_OVERRIDES } = require('./event-spawn-overrides');

const SCRAPEDDUCK_URL = 'https://raw.githubusercontent.com/bigfoott/ScrapedDuck/data/events.json';
const REFRESH_INTERVAL_MS = 60 * 60 * 1000; // hourly — LeekDuck/ScrapedDuck updates on its own schedule, no need to hammer it

let cachedEvents = FALLBACK_EVENTS;
let usingFallback = true;
let lastFetchOk = false;
let lastFetchError = null;
let lastFetchTime = null;

function httpsGetJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'whats-the-go-buddy-bot (contact via Discord server admin)' } }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Response was not valid JSON: ' + e.message)); }
      });
    }).on('error', reject);
  });
}

// Best-guess mapping of ScrapedDuck's `eventType` values to this bot's
// internal mechanicType + a representative color type. Unknown event types
// fall back to 'normal' rather than throwing.
const TYPE_MAP = {
  'community-day': { mechanicType: 'community', colorTypeFallback: 'normal' },
  'raid-day': { mechanicType: 'raid', colorTypeFallback: 'normal' },
  'raid-hour': { mechanicType: 'raid', colorTypeFallback: 'normal' },
  'raid-battles': { mechanicType: 'raid', colorTypeFallback: 'normal' },
  'pokemon-spotlight-hour': { mechanicType: 'spotlight', colorTypeFallback: 'normal' },
  'max-battles': { mechanicType: 'dynamax', colorTypeFallback: 'steel' },
  'go-battle-league': { mechanicType: 'league', colorTypeFallback: null },
  'season': { mechanicType: 'season', colorTypeFallback: null },
  'research': { mechanicType: 'research', colorTypeFallback: 'normal' },
  'event': { mechanicType: 'global', colorTypeFallback: null },
};

function mapSpeciesNamesToIds(names) {
  if (!Array.isArray(names)) return [];
  const ids = [];
  for (const name of names) {
    const matches = findByName(name);
    if (matches.length) ids.push(matches[0].id);
    // silently skip names we can't match rather than crashing the whole event
  }
  return ids;
}

function transformEvent(raw) {
  try {
    const id = raw.eventID || raw.id;
    const title = raw.name || raw.heading || raw.title;
    const start = raw.start ? new Date(raw.start).getTime() : null;
    const end = raw.end ? new Date(raw.end).getTime() : null;
    if (!id || !title || !start || !end) return null; // not enough to work with, skip rather than guess

    const typeInfo = TYPE_MAP[raw.eventType] || { mechanicType: 'global', colorTypeFallback: null };
    const extra = raw.extraData || {};

    const bonuses = (extra.bonuses || extra.generalBonuses || []).map(b => ({
      glyph: '\u2726',
      value: b.text || b.title || String(b),
      label: b.text || '',
    }));

    const raidBossNames = (extra.raidbattles && extra.raidbattles.bosses) ? extra.raidbattles.bosses.map(b => b.name) : [];
    const raidBosses = mapSpeciesNamesToIds(raidBossNames).map(pid => ({
      id: pid, note: 'Raid boss', tier: 'unknown', tierLabel: 'Raid', weight: 3,
    }));

    // ScrapedDuck only gives a real spawns array for some event types — for generic
    // "event" entries it just reports extraData.generic.hasSpawns: true/false with no
    // species list. Fall back to a manually-verified override for known cases like that
    // (see event-spawn-overrides.js) rather than showing an empty spawns list.
    const spawnNames = extra.spawns ? extra.spawns.map(s => s.name || s) : (EVENT_SPAWN_OVERRIDES[id] || []);
    const wildSpawns = mapSpeciesNamesToIds(spawnNames);

    return {
      id: String(id),
      title,
      mechanicType: typeInfo.mechanicType,
      typeLabel: raw.eventType || 'Event',
      colorTypes: typeInfo.colorTypeFallback ? [typeInfo.colorTypeFallback] : [],
      start, end,
      summary: raw.subheading || raw.description || title,
      highlight: null, // ScrapedDuck doesn't provide a "trainer tip" — that was hand-written for the static seed events
      bonuses,
      raidBosses,
      wildSpawns,
    };
  } catch (err) {
    console.error('[live-events] failed to transform one event, skipping it:', err.message);
    return null;
  }
}

async function refreshEvents() {
  try {
    const raw = await httpsGetJson(SCRAPEDDUCK_URL);
    if (!Array.isArray(raw)) throw new Error(`Expected an array from ScrapedDuck, got ${typeof raw}`);

    const transformed = raw.map(transformEvent).filter(Boolean);
    if (transformed.length === 0) {
      throw new Error('Parsed 0 usable events from a non-empty ScrapedDuck response \u2014 the schema probably changed, see the comment at the top of this file');
    }

    cachedEvents = transformed;
    usingFallback = false;
    lastFetchOk = true;
    lastFetchError = null;
    console.log(`[live-events] refreshed from ScrapedDuck: ${transformed.length} events`);
  } catch (err) {
    lastFetchOk = false;
    lastFetchError = err.message;
    usingFallback = true;
    cachedEvents = FALLBACK_EVENTS;
    console.error('[live-events] fetch/parse failed, falling back to static seed data:', err.message);
  }
  lastFetchTime = new Date();
}

function getEvents() { return cachedEvents; }
function getStatus() {
  return { lastFetchOk, lastFetchError, lastFetchTime, eventCount: cachedEvents.length, usingFallback };
}

function startLiveEventsRefresh() {
  refreshEvents();
  setInterval(refreshEvents, REFRESH_INTERVAL_MS);
  console.log(`[live-events] refreshing from ScrapedDuck every ${REFRESH_INTERVAL_MS / 60000} minutes`);
}

module.exports = { getEvents, getStatus, startLiveEventsRefresh, refreshEvents };
