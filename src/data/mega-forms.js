// Mega Evolution data for species that only exist in the 956-species "basic"
// roster (roster-expanded.js), which never carries real PVE detail on its own.
// This is the standard, canonical set of Mega Evolutions actually available in
// Pokémon GO (mirrors the mainline-games ORAS Mega roster). Species that
// already have full curated Mega data with real tier/moveset research
// (Gyarados, Garchomp, Metagross, Tyranitar, Swampert, Mewtwo) are not
// repeated here — see pokemon-curated.js for those.
//
// Same honesty rule as the rest of this project: no real eDPS was computed
// for any of these 40 species' Mega form, so every entry here is a coarse
// tier-band estimate (🔹), the same category roster.js already uses for the
// ~900 non-curated species via ESTIMATED_PVE_PROFILE. Never a fabricated
// precise number — see roster.js's merge step for how `estimated: true` gets
// attached and surfaced.

const MEGA_TIER_PROFILE = {
  legendary: { tier: 'A', dpsBar: 78 },
  strong: { tier: 'B+', dpsBar: 62 },
};

// { name: exact species name as it appears in roster-expanded.js, band: 'legendary' | 'strong' }
// `label` overrides the display name for species with more than one Mega form in-game
// (Charizard has X and Y; only one can be represented here, so Y — the more commonly
// used raid attacker of the two — is the one included).
const MEGA_FORMS = [
  { name: 'Venusaur', band: 'strong' },
  { name: 'Charizard', band: 'legendary', label: 'Mega Charizard Y', note: 'Also has a Mega Charizard X form (Dragon/Fire) not separately tracked here.' },
  { name: 'Blastoise', band: 'strong' },
  { name: 'Beedrill', band: 'strong' },
  { name: 'Pidgeot', band: 'strong' },
  { name: 'Alakazam', band: 'legendary' },
  { name: 'Slowbro', band: 'strong' },
  { name: 'Gengar', band: 'legendary' },
  { name: 'Kangaskhan', band: 'strong' },
  { name: 'Pinsir', band: 'strong' },
  { name: 'Aerodactyl', band: 'legendary' },
  { name: 'Ampharos', band: 'strong' },
  { name: 'Steelix', band: 'strong' },
  { name: 'Scizor', band: 'legendary' },
  { name: 'Heracross', band: 'strong' },
  { name: 'Houndoom', band: 'legendary' },
  { name: 'Sceptile', band: 'legendary' },
  { name: 'Blaziken', band: 'legendary' },
  { name: 'Gardevoir', band: 'strong' },
  { name: 'Sableye', band: 'strong' },
  { name: 'Mawile', band: 'strong' },
  { name: 'Aggron', band: 'strong' },
  { name: 'Medicham', band: 'strong' },
  { name: 'Manectric', band: 'strong' },
  { name: 'Sharpedo', band: 'strong' },
  { name: 'Camerupt', band: 'strong' },
  { name: 'Altaria', band: 'strong' },
  { name: 'Banette', band: 'strong' },
  { name: 'Absol', band: 'strong' },
  { name: 'Glalie', band: 'strong' },
  { name: 'Salamence', band: 'legendary' },
  { name: 'Latias', band: 'legendary' },
  { name: 'Latios', band: 'legendary' },
  { name: 'Rayquaza', band: 'legendary' },
  { name: 'Lopunny', band: 'strong' },
  { name: 'Lucario', band: 'legendary' },
  { name: 'Abomasnow', band: 'strong' },
  { name: 'Gallade', band: 'strong' },
  { name: 'Audino', band: 'strong' },
  { name: 'Diancie', band: 'legendary' },
];

module.exports = { MEGA_FORMS, MEGA_TIER_PROFILE };
