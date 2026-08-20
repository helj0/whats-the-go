// Suggests Star Piece / Lucky Egg / Incense for an event based on its bonus
// text (keyword matching) plus a couple of well-established rules of thumb
// for event types where the bonus text alone doesn't say it explicitly
// (e.g. Community Day is worth a Lucky Egg almost regardless of what its
// bonus list says, because of how catch volume works during one).
//
// Each returned recommendation includes a `why` string — never suggest an
// item without saying which bonus text or rule triggered it.

function bonusText(ev) {
  return ev.bonuses.map(b => `${b.value} ${b.label}`).join(' | ').toLowerCase();
}

function recommendItems(ev) {
  const text = bonusText(ev);
  const recs = [];

  if (/stardust|dust/.test(text)) {
    recs.push({ item: 'Star Piece', emoji: '💎', why: 'This event boosts Stardust — a Star Piece stacks on top for the full window.' });
  }
  if (/\bxp\b/.test(text)) {
    recs.push({ item: 'Lucky Egg', emoji: '🥚', why: 'Bonus XP is active — a Lucky Egg doubles whatever you earn during the event.' });
  }
  if (/flooded|spawn|incense|lure|everywhere/.test(text)) {
    recs.push({ item: 'Incense', emoji: '🌸', why: 'Spawns are boosted — Incense stacks with the event bonus for even more encounters.' });
  }

  // Rule of thumb: Community Day is almost always worth a Lucky Egg for the
  // catch/evolve volume alone, even when the bonus list doesn't spell out XP.
  if (ev.mechanicType === 'community' && !recs.some(r => r.item === 'Lucky Egg')) {
    recs.push({ item: 'Lucky Egg', emoji: '🥚', why: "Community Days mean a high catch/evolve volume in a short window — a Lucky Egg is almost always worth it, even when it's not explicitly one of the listed bonuses." });
  }
  if (ev.mechanicType === 'community' && !recs.some(r => r.item === 'Incense')) {
    recs.push({ item: 'Incense', emoji: '🌸', why: 'Spawns are already flooded during Community Day — Incense adds even more on top.' });
  }

  return recs;
}

module.exports = { recommendItems };
