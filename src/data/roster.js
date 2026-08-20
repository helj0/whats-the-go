// Builds the unified species roster once, at process start, and exports it.
// Mirrors the same merge logic used in the companion web app: 30 hand-curated
// species with real/researched detail, plus 956 more (Gen 1-9) with an
// estimated PVE tier band, real PvPoke-sourced PVP data for 51 of them, and
// computed eDPS "power level" for 53 of them.
//
// Every species carries an explicit `dataSource` object so commands can be
// honest in embeds about what's real vs. estimated — do not strip this out
// when adding features. See HANDOFF.md in the source web app for the full
// data-honesty rationale this project has followed throughout.

const { POKEMON: CURATED } = require('./pokemon-curated');
const { POKEMON_BASIC_RAW } = require('./roster-expanded');
const { PVPOKE_REAL } = require('./pvp-sourced');
const { EDPS_DATA } = require('./edps');

const ESTIMATED_PVE_PROFILE = {
  legendary: { tier: 'A', dpsBar: 78 },
  strong: { tier: 'B+', dpsBar: 62 },
  regular: { tier: 'C', dpsBar: 42 },
};

const PVPOKE_REAL_BY_DEX = {};
for (const r of PVPOKE_REAL) PVPOKE_REAL_BY_DEX[r.dex] = r;

const POKEMON = { ...CURATED };

for (const row of POKEMON_BASIC_RAW) {
  const [dex, name, types, hasShiny, tierBand = 'regular'] = row;
  const id = 'gen-' + dex;
  const prof = ESTIMATED_PVE_PROFILE[tierBand];
  const real = PVPOKE_REAL_BY_DEX[dex];

  let pvp = { great: { available: false }, ultra: { available: false }, master: { available: false }, movesets: [] };
  if (real) {
    if (real.great) pvp.great = { available: true, rank: real.great.rank, pool: real.great.pool, sourced: true };
    if (real.ultra) pvp.ultra = { available: true, rank: real.ultra.rank, pool: real.ultra.pool, sourced: true };
    const src = real.great || real.ultra;
    pvp.movesets = [{ fast: src.fast, charge: src.charges[0], tag: 'best' }];
    if (src.charges[1]) pvp.movesets.push({ fast: src.fast, charge: src.charges[1], tag: 'good' });
  }

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
    pvp,
    bulbapedia: `https://bulbapedia.bulbagarden.net/wiki/${encodeURIComponent(name)}_(Pok%C3%A9mon)`,
  };
}

// Attach eDPS to curated species too (keyed by their own string ids in edps.js)
for (const id of Object.keys(EDPS_DATA)) {
  if (POKEMON[id] && !POKEMON[id].pve.edps) POKEMON[id].pve.edps = EDPS_DATA[id];
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
