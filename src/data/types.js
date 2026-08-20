// Type colors (brand colors, matches the companion web app), emoji (for a light,
// bubbly feel in embeds without needing hosted images), and the real Pokémon GO
// type-effectiveness chart (1.6x / 0.625x per super-effective/not-very-effective
// step, matching in-game multipliers) used by the counters command.

const TYPE_COLORS = {
  normal:'#A8A878', fire:'#F08030', water:'#5B9CFF', electric:'#F8D030', grass:'#4FBE6B',
  ice:'#7FD6D6', fighting:'#C03028', poison:'#A24FD1', ground:'#D9A441', flying:'#A890F0',
  psychic:'#F85888', bug:'#A8B820', rock:'#B8A038', ghost:'#7A5FC7', dragon:'#7C5CFF',
  dark:'#5A5468', steel:'#8E96B8', fairy:'#EE99AC'
};

const TYPE_LIST = ['normal','fire','water','electric','grass','ice','fighting','poison','ground',
  'flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'];

const TYPE_EMOJI = {
  normal:'⚪', fire:'🔥', water:'💧', electric:'⚡', grass:'🌿', ice:'❄️', fighting:'🥊',
  poison:'☠️', ground:'🌎', flying:'🪽', psychic:'🔮', bug:'🐛', rock:'🪨', ghost:'👻',
  dragon:'🐉', dark:'🌑', steel:'⚙️', fairy:'✨'
};

// attacker type -> { defender type: multiplier }, only non-1x listed
const TYPE_CHART = {
  water:  {fire:1.6, ground:1.6, rock:1.6, water:0.625, grass:0.625, dragon:0.625},
  fire:   {grass:1.6, ice:1.6, bug:1.6, steel:1.6, fire:0.625, water:0.625, rock:0.625, dragon:0.625},
  grass:  {water:1.6, ground:1.6, rock:1.6, fire:0.625, grass:0.625, poison:0.625, flying:0.625, bug:0.625, dragon:0.625, steel:0.625},
  electric:{water:1.6, flying:1.6, electric:0.625, grass:0.625, dragon:0.625, ground:0.390625},
  ice:    {grass:1.6, ground:1.6, flying:1.6, dragon:1.6, fire:0.625, water:0.625, ice:0.625, steel:0.625},
  fighting:{normal:1.6, ice:1.6, rock:1.6, dark:1.6, steel:1.6, poison:0.625, flying:0.625, psychic:0.625, bug:0.625, fairy:0.625, ghost:0.390625},
  poison: {grass:1.6, fairy:1.6, poison:0.625, ground:0.625, rock:0.625, ghost:0.625, steel:0.390625},
  ground: {fire:1.6, electric:1.6, poison:1.6, rock:1.6, steel:1.6, grass:0.625, bug:0.625, flying:0.390625},
  flying: {grass:1.6, fighting:1.6, bug:1.6, electric:0.625, rock:0.625, steel:0.625},
  psychic:{fighting:1.6, poison:1.6, psychic:0.625, steel:0.625, dark:0.390625},
  bug:    {grass:1.6, psychic:1.6, dark:1.6, fire:0.625, fighting:0.625, poison:0.625, flying:0.625, ghost:0.625, steel:0.625, fairy:0.625},
  rock:   {fire:1.6, ice:1.6, flying:1.6, bug:1.6, fighting:0.625, ground:0.625, steel:0.625},
  ghost:  {psychic:1.6, ghost:1.6, dark:0.625, normal:0.390625},
  dragon: {dragon:1.6, steel:0.625, fairy:0.390625},
  dark:   {psychic:1.6, ghost:1.6, fighting:0.625, dark:0.625, fairy:0.625},
  steel:  {ice:1.6, rock:1.6, fairy:1.6, fire:0.625, water:0.625, electric:0.625, steel:0.625},
  fairy:  {fighting:1.6, dragon:1.6, dark:1.6, fire:0.625, poison:0.625, steel:0.625},
  normal: {rock:0.625, ghost:0.390625, steel:0.625},
};

function typeEffectiveness(attackType, defTypes) {
  let mult = 1;
  for (const dt of defTypes) {
    mult *= (TYPE_CHART[attackType] && TYPE_CHART[attackType][dt]) || 1;
  }
  return mult;
}

module.exports = { TYPE_COLORS, TYPE_LIST, TYPE_EMOJI, TYPE_CHART, typeEffectiveness };
