// Best PVE (raid) counters for a target species: finds attacker types that
// are super-effective (>=1.6x) against the target's type(s), then ranks
// candidates by real eDPS where we have it, falling back to the estimated
// PVE tier band for everyone else — same honesty tiering as the rest of
// this project. Never fabricates a precise number for species we don't
// have one for.

const { POKEMON, ALL_POKEMON } = require('../data/roster');
const { typeEffectiveness, TYPE_LIST } = require('../data/types');

const TIER_POWER_FALLBACK = { 'S+':60,'S':55,'A+':50,'A':45,'A-':40,'B+':35,'B':30,'B-':25,'C+':22,'C':18,'C-':14,'D+':10,'D':7,'F':4 };

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

    const role = p.pve.legendary && p.pve.legendary.available ? p.pve.legendary : p.pve.standard;
    if (!role || !role.available) continue;

    let powerBase, source;
    if (p.pve.edps) {
      powerBase = p.pve.edps.edps;
      source = p.pve.edps.source; // 'verified' | 'estimated'
    } else {
      powerBase = TIER_POWER_FALLBACK[role.tier] || 10;
      source = role.estimated ? 'tier-estimate' : 'tier';
    }

    candidates.push({
      pokemon: p,
      effectiveness: bestEff,
      score: powerBase * bestEff,
      source,
      moveset: p.pve.edps ? { fast: p.pve.edps.fast, charge: p.pve.edps.charge } : null,
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, limit);
}

module.exports = { bestCountersFor };
