// Best PVE (raid) counters for a target species: finds attacker types that
// are super-effective (>=1.6x) against the target's type(s), then ranks
// candidates by real eDPS where we have it, falling back to the estimated
// PVE tier band for everyone else — same honesty tiering as the rest of
// this project. Never fabricates a precise number for species we don't
// have one for.

const { POKEMON, ALL_POKEMON } = require('../data/roster');
const { typeEffectiveness, TYPE_LIST } = require('../data/types');

const TIER_POWER_FALLBACK = { 'S+':60,'S':55,'A+':50,'A':45,'A-':40,'B+':35,'B':30,'B-':25,'C+':22,'C':18,'C-':14,'D+':10,'D':7,'F':4 };

// Picks the strongest available role for a species. Mega > Legendary > Shadow > standard —
// Mega's temporary Attack boost generally outperforms even the Shadow bonus while it's active.
// Previously this only ever checked legendary/standard, so every species with real Mega or
// Shadow raid data (Mega Gyarados, Shadow Tyranitar, etc.) was silently invisible to /counters.
function selectRole(p) {
  if (p.pve.mega && p.pve.mega.available) return { role: p.pve.mega, form: 'Mega' };
  if (p.pve.legendary && p.pve.legendary.available) return { role: p.pve.legendary, form: null };
  if (p.pve.shadow && p.pve.shadow.available) return { role: p.pve.shadow, form: 'Shadow' };
  if (p.pve.standard && p.pve.standard.available) return { role: p.pve.standard, form: null };
  return null;
}

function bestCountersFor(target, limit = 10) {
  const defTypes = target.types;
  const candidates = [];

  for (const p of ALL_POKEMON) {
    if (p.id === target.id) continue;
    let bestEff = 1;
    for (const t of p.types) {
      const eff = typeEffectiveness(t, defTypes);
      if (eff > bestEff) bestEff = eff;
    }
    if (bestEff < 1.6) continue; // not actually a type counter

    const picked = selectRole(p);
    if (!picked) continue;
    const { role, form } = picked;

    // The recorded eDPS number (edps.js) reflects standard-form moves only — only trust it
    // when the standard role is actually what got picked, otherwise it'd misrepresent a
    // Mega/Shadow/Legendary form's power using the base form's real-world measurement.
    let powerBase, source, moveset;
    if (!form && p.pve.edps && role === p.pve.standard) {
      powerBase = p.pve.edps.edps;
      source = p.pve.edps.source; // 'verified' | 'estimated'
      moveset = { fast: p.pve.edps.fast, charge: p.pve.edps.charge };
    } else {
      powerBase = TIER_POWER_FALLBACK[role.tier] || 10;
      source = role.estimated ? 'tier-estimate' : 'tier';
      moveset = role.fast ? { fast: role.fast, charge: role.charge } : null;
    }

    candidates.push({
      pokemon: p,
      form,
      effectiveness: bestEff,
      score: powerBase * bestEff,
      source,
      moveset,
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, limit);
}

module.exports = { bestCountersFor };
