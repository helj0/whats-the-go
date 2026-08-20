// Manual wild-spawn overrides, keyed by ScrapedDuck's eventID.
//
// ScrapedDuck's events.json only carries a real `extraData.spawns` list for
// certain event types (raid days, community days, etc). For generic banner
// events — eventType: "event" — it only ever reports
// `extraData.generic.hasSpawns: true/false`, with no actual species list.
// transformEvent() in live-events.js has nothing to map in that case, so
// wildSpawns silently comes back empty even though the event genuinely does
// boost specific spawns. This file plugs that specific, confirmed gap —
// verified directly against the real feed (see live-events.js's merge step)
// and cross-checked against the event's LeekDuck page, not guessed.
//
// Species names must match this bot's roster (src/data/roster.js) exactly
// enough for findByName to resolve them — verify with:
//   node -e "console.log(require('./src/data/roster').findByName('Name'))"

const EVENT_SPAWN_OVERRIDES = {
  'water-festival-2026': [
    // Common spawns
    'Psyduck', 'Tentacool', 'Goldeen', 'Magikarp', 'Marill', 'Wailmer',
    'Corphish', 'Ducklett', 'Frillish', 'Mareanie', 'Dewpider', 'Wimpod',
    // Rarer spawns ("Some Trainers might even encounter the following!")
    'Gyarados', 'Feebas', 'Clamperl',
    // Increased-frequency regional note, not a boosted-spawn species per se,
    // but LeekDuck lists it in the same Spawns section
    'Wiglett',
  ],
};

module.exports = { EVENT_SPAWN_OVERRIDES };
