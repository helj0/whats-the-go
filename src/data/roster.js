// Builds the unified species roster once, at process start, and exports it.
// PVE-focused only — this bot does not track or display any PVP data.
// Mirrors the companion web app's merge logic: 30 hand-curated species with
// real/researched PVE detail, plus 956 more (Gen 1-9) with an estimated PVE
// tier band, and computed eDPS "power level" for 53 of them.
//
// Every species carries an explicit source marker (`estimated: true` /
// `isBasic: true` / eDPS `source`) so commands can be honest in embeds
// about what's real vs. estimated — do not strip this out when extending.

const { POKEMON: CURATED } = require('./pokemon-curated');
const { POKEMON_BASIC_RAW } = require('./roster-expanded');
const { EDPS_DATA } = require('./edps');
const { MEGA_FORMS, MEGA_TIER_PROFILE } = require('./mega-forms');

const ESTIMATED_PVE_PROFILE = {
  legendary: { tier: 'A', dpsBar: 78 },
  strong: { tier: 'B+', dpsBar: 62 },
  regular: { tier: 'C', dpsBar: 42 },
};

const POKEMON = {};
// Curated species come with a legacy `pvp` block baked into their source
// data (pokemon-curated.js, ported from the web app) — strip it here so
// nothing PVP-related exists anywhere in the runtime roster, even unused.
for (const [id, p] of Object.entries(CURATED)) {
  const { pvp, ...rest } = p;
  POKEMON[id] = rest;
}

for (const row of POKEMON_BASIC_RAW) {
  const [dex, name, types, hasShiny, tierBand = 'regular'] = row;
  const id = 'gen-' + dex;
  const prof = ESTIMATED_PVE_PROFILE[tierBand];

  POKEMON[id] = {
    id, name, dex, types, hasShiny,
    isBasic: true,
    tierBand,
    pve: {
      standard: { available: true, tier: prof.tier, dpsBar: prof.dpsBar, estimated: true },
      shadow: { available: false }, mega: { available: false },
      legendary: tierBand === 'legendary' ? { available: true, tier: prof.tier, dpsBar: prof.dpsBar, estimated: true } : { available: false },
      edps: EDPS_DATA[id] || null,
    },
    bulbapedia: `https://bulbapedia.bulbagarden.net/wiki/${encodeURIComponent(name)}_(Pok%C3%A9mon)`,
  };
}

// Attach eDPS to curated species too (keyed by their own string ids in edps.js)
for (const id of Object.keys(EDPS_DATA)) {
  if (POKEMON[id] && !POKEMON[id].pve.edps) POKEMON[id].pve.edps = EDPS_DATA[id];
}

// Attach tier-band Mega data to species that only exist in the basic roster
// (see mega-forms.js). Matches by name since these species don't have curated
// ids — skips anything already carrying real curated Mega data so this never
// clobbers researched entries like Gyarados/Garchomp/Metagross/Tyranitar/Swampert.
for (const entry of MEGA_FORMS) {
  const match = Object.values(POKEMON).find(p => p.name === entry.name);
  if (!match) continue; // name not found in the roster — skip rather than guess
  if (match.pve.mega && match.pve.mega.available) continue; // already has real curated data
  const prof = MEGA_TIER_PROFILE[entry.band];
  match.pve.mega = {
    available: true,
    tier: prof.tier,
    dpsBar: prof.dpsBar,
    estimated: true,
    label: entry.label || `Mega ${match.name}`,
    note: entry.note || 'Tier-band estimate — no precise DPS computed for this Mega form yet.',
  };
}

const ALL_POKEMON = Object.values(POKEMON).sort((a, b) => a.name.localeCompare(b.name));

function findByName(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  // exact match first, then "starts with", then "includes"
  const exact = ALL_POKEMON.filter(p => p.name.toLowerCase() === q);
  if (exact.length) return exact;
  const starts = ALL_POKEMON.filter(p => p.name.toLowerCase().startsWith(q));
  if (starts.length) return starts;
  return ALL_POKEMON.filter(p => p.name.toLowerCase().includes(q));
}

function autocompleteChoices(query, limit = 25) {
  return findByName(query).slice(0, limit).map(p => ({ name: `${p.name} (#${p.dex})`, value: p.id }));
}

module.exports = { POKEMON, ALL_POKEMON, findByName, autocompleteChoices };
