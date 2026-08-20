// Per-user, per-event medal status — ported from the companion web app's
// Medals tab. Gold = every featured species caught (base form). Platinum =
// Gold + every shiny-eligible featured species caught in shiny form too.
// Events with no featured species (league events, global events, etc.)
// don't get a medal at all.

const { POKEMON } = require('../data/roster');
const db = require('../db');

function eventFeaturedSpecies(ev) {
  const ids = [];
  (ev.wildSpawns || []).forEach(id => { if (!ids.includes(id)) ids.push(id); });
  (ev.raidBosses || []).forEach(rb => { if (!ids.includes(rb.id)) ids.push(rb.id); });
  return ids.filter(id => POKEMON[id]);
}

async function eventMedalStatus(userId, ev) {
  const species = eventFeaturedSpecies(ev);
  if (species.length === 0) {
    return { medal: 'none', species, baseDone: 0, baseTotal: 0, shinyDone: 0, shinyTotal: 0 };
  }

  const catches = await db.getEventCatches(userId, ev.id);
  const baseCaught = new Set(catches.filter(c => !c.shiny).map(c => c.pokemon_id));
  const shinyCaught = new Set(catches.filter(c => c.shiny).map(c => c.pokemon_id));

  let baseDone = 0, shinyDone = 0, shinyTotal = 0;
  for (const id of species) {
    const p = POKEMON[id];
    if (baseCaught.has(id)) baseDone++;
    if (p.hasShiny) {
      shinyTotal++;
      if (shinyCaught.has(id)) shinyDone++;
    }
  }
  const baseTotal = species.length;
  const gold = baseDone === baseTotal;
  const platinum = gold && shinyDone === shinyTotal;

  return { medal: platinum ? 'platinum' : gold ? 'gold' : 'locked', species, baseDone, baseTotal, shinyDone, shinyTotal };
}

module.exports = { eventFeaturedSpecies, eventMedalStatus };
