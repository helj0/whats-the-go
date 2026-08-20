// Static seed/fallback event data (12 real Aug-Sep 2026 events, hand-curated
// including the "Trainer tip" for each). This is NO LONGER the primary event
// source — see ./live-events.js, which fetches live from ScrapedDuck and
// falls back to this file only if that fetch fails or its response looks
// malformed. Kept around specifically so the bot never has zero event data
// to show, even on a bad network day.

function d(y,mo,day,h,mi){ return new Date(y,mo-1,day,h||0,mi||0).getTime(); }

const EVENTS = [
  { id:'venom-vines', title:'Choose Your Path: Venom and Vines', mechanicType:'research', typeLabel:'Timed Research', colorTypes:['grass','poison'],
    start:d(2026,8,11,10,0), end:d(2026,8,17,20,0),
    summary:'Best week to stock up on Poison and Grass candy before the meta shifts next month.',
    highlight:'Pick the Battle path for the most encounters if you\'re farming candy — Explore gives more Stardust instead.',
    bonuses:[ {glyph:'◆',value:'3 paths',label:'Explore, Catch, or Battle — pick one'}, {glyph:'✦',value:'Bonus XP',label:'Tied to your chosen path'}, {glyph:'◇',value:'Featured',label:'Venonat & Fomantis encounters'} ],
    raidBosses:[], wildSpawns:['venonat','fomantis'] },

  { id:'gbl-master-evocup', title:'Master League & Evolution Cup', mechanicType:'league', typeLabel:'Battle League', colorTypes:[],
    start:d(2026,8,11,13,0), end:d(2026,8,18,13,0), isLeagueEvent:true,
    summary:'Bring your bulkiest attackers — Evolution Cup rewards species with room left to grow.',
    highlight:'Master League favors bulky attackers with no CP ceiling; Evolution Cup rewards mons that have evolved once but can still evolve further — dust off a mid-evolution box mon.',
    bonuses:[ {glyph:'★',value:'2 formats',label:'Active in the League tab'}, {glyph:'◆',value:'Weekly',label:'Rotates again Aug 18'} ],
    leaguePanels:[ {name:'Master League', desc:'No CP cap — bring your strongest roster.'}, {name:'Evolution Cup: Great League Edition', desc:'1,500 CP cap. Only species that have evolved at least once and can still evolve further are eligible.'} ],
    raidBosses:[], wildSpawns:[] },

  { id:'megaraid-garchomp', title:'Mega Garchomp Raids', mechanicType:'megaraid', typeLabel:'Mega Raid', colorTypes:['dragon','ground'],
    start:d(2026,8,12,6,0), end:d(2026,8,18,21,0),
    summary:'A genuine top-tier Ground attacker — worth maxing even after the raid window closes.',
    highlight:'Bring 3-4 trainers minimum — Mega Garchomp hits hard enough that under-leveled groups will time out.',
    bonuses:[ {glyph:'◆',value:'Every gym',label:'Mega Garchomp available now'}, {glyph:'✦',value:'Bonus',label:'Extra Mega Energy, first win daily'} ],
    raidBosses:[{id:'garchomp', note:'Mega Raid — bring a group', tier:'mega', tierLabel:'Mega', weight:4.5}], wildSpawns:[] },

  { id:'groudon-raid', title:'Groudon Returns to Raids', mechanicType:'legendaryraid', typeLabel:'Legendary Raid', colorTypes:['ground'],
    start:d(2026,8,12,6,0), end:d(2026,8,18,21,0),
    summary:'Top Ground-type raid pick — still elite even with newer Mega attackers around.',
    highlight:'Use your best Grass, Water, or Ice attacker as lead — Groudon\'s Fire Punch can catch a bad matchup off guard.',
    bonuses:[ {glyph:'★',value:'5-star',label:'Legendary Raid boss'}, {glyph:'◇',value:'Counters',label:'Grass, Water & Ice hit hardest'} ],
    raidBosses:[{id:'groudon', note:'5-star Raid', tier:5, tierLabel:'5★ Legendary', weight:5}], wildSpawns:[] },

  { id:'dynamax-beldum', title:'Dynamax Beldum Debut', mechanicType:'dynamax', typeLabel:'Max Battles', colorTypes:['steel','psychic'],
    start:d(2026,8,10,0,0), end:d(2026,8,16,21,0),
    summary:'Skip the wild grind — Power Spots are the fastest way to a maxed Metagross line.',
    highlight:'Spin every Power Spot you pass this week — Max Particles are the bottleneck for unlocking Dynamax Beldum\'s moves.',
    bonuses:[ {glyph:'✦',value:'Debut',label:"Beldum's first Max Battle appearance"}, {glyph:'◆',value:'All week',label:'Featured in Power Spots'} ],
    raidBosses:[{id:'beldum', note:'Max Battle — power up Power Spots to find it', tier:'max', tierLabel:'Max Battle', weight:2}], wildSpawns:[] },

  { id:'community-nickit', title:'August Community Day: Nickit', mechanicType:'community', typeLabel:'Community Day', colorTypes:['dark'],
    start:d(2026,8,16,14,0), end:d(2026,8,16,17,0),
    summary:'Rare shot at a high-IV Thievul — stock up on XL candy while spawns are flooded.',
    highlight:'Stock up on Poké Balls and Berries before 2pm local — Community Day spawns get overwhelming fast in busy areas.',
    bonuses:[ {glyph:'★',value:'Flooded',label:'Nickit spawns across the map'}, {glyph:'◆',value:'3-hr',label:'Incense & Lure duration'}, {glyph:'✦',value:'Bonus',label:'XL Candy on catch'} ],
    raidBosses:[{id:'thievul', note:'Community Day raid — exclusive move on win', tier:3, tierLabel:'3★', weight:3}], wildSpawns:['nickit'] },

  { id:'dynamax-magikarp', title:'Dynamax Magikarp Week', mechanicType:'dynamax', typeLabel:'Max Battles', colorTypes:['water'],
    start:d(2026,8,17,0,0), end:d(2026,8,23,21,0),
    summary:'Low effort, high reward — free candy toward a top-tier Mega raid attacker.',
    highlight:'No need to rush — candy from Dynamax Magikarp keeps accruing all week, so spread your Max Battles out.',
    bonuses:[ {glyph:'✦',value:'Debut',label:"Magikarp's first Max Battle appearance"}, {glyph:'◆',value:'Candy',label:'Great farming opportunity'} ],
    raidBosses:[{id:'magikarp', note:'Max Battle debut', tier:'max', tierLabel:'Max Battle', weight:2}], wildSpawns:[] },

  { id:'water-festival', title:'Ultra Unlock: Water Festival', mechanicType:'season', typeLabel:'Ultra Unlock', colorTypes:['water'],
    start:d(2026,8,18,10,0), end:d(2026,8,24,20,0),
    summary:'Great week for Water-type shiny hunting across raids, spawns, and eggs.',
    highlight:'Check egg hatches and raid rotations daily this week — the Water Festival boosts spawns across all three categories at once.',
    bonuses:[ {glyph:'◇',value:'Boosted',label:'Water-type raids, spawns & eggs'}, {glyph:'★',value:'Extra',label:'Special Trade range'} ],
    raidBosses:[], wildSpawns:['gen-54','gen-72','gen-118','magikarp','gen-183','gen-320','gen-341','gen-580','gen-592','gen-747','gen-751','gen-767','gyarados','gen-349','gen-366','gen-960'] },

  { id:'megaraid-starmie', title:'Mega Starmie Raid Day', mechanicType:'megaraid', typeLabel:'Mega Raid Day', colorTypes:['water','psychic'],
    start:d(2026,8,22,11,0), end:d(2026,8,22,17,0),
    summary:'Best Water/Psychic burst damage for the day — pairs well with Fire-type raids.',
    highlight:'Arrive early — Mega Starmie Raid Day gyms fill up fast, and latecomers may need to wait for the next timer.',
    bonuses:[ {glyph:'◆',value:'Every slot',label:'Mega Starmie in raids'}, {glyph:'✦',value:'Bonus',label:'Mega Energy per win'}, {glyph:'★',value:'Higher',label:'Shiny rate for the day'} ],
    raidBosses:[{id:'starmie', note:'Mega Raid Day — solo-able for strong trainers', tier:'mega', tierLabel:'Mega', weight:4.5}], wildSpawns:[] },

  { id:'lunala-raid', title:'Lunala Debuts in Raids', mechanicType:'legendaryraid', typeLabel:'Legendary Raid', colorTypes:['psychic','ghost'],
    start:d(2026,8,19,6,0), end:d(2026,8,25,21,0),
    summary:'First chance ever at a shiny Lunala — a genuine must-catch raid.',
    highlight:'Save your Premier Balls — Lunala\'s shiny rate is elevated for the whole window, not just the Raid Hour.',
    bonuses:[ {glyph:'✦',value:'First ever',label:"Lunala's shiny form debuts now"}, {glyph:'★',value:'5-star',label:'Legendary Raid boss'} ],
    raidBosses:[{id:'lunala', note:"5-star Raid — Lunala's shiny debut", tier:5, tierLabel:'5★ Legendary', weight:5}], wildSpawns:[] },

  { id:'spotlight-magikarp', title:'Spotlight Hour: Magikarp', mechanicType:'spotlight', typeLabel:'Spotlight Hour', colorTypes:['water'],
    start:d(2026,8,20,18,0), end:d(2026,8,20,19,0),
    summary:'Skip it unless you need candy — Magikarp offers little beyond XP this hour.',
    highlight:'Only worth it if you\'re missing this line\'s candy — otherwise skip and save your hour for something better.',
    bonuses:[ {glyph:'◇',value:'Everywhere',label:'Magikarp spawns for the hour'}, {glyph:'★',value:'×2',label:'Catch XP'} ],
    raidBosses:[], wildSpawns:['magikarp'] },

  { id:'worlds-2026', title:'GO at Worlds 2026', mechanicType:'global', typeLabel:'Global Event', colorTypes:[],
    start:d(2026,8,25,0,0), end:d(2026,8,30,23,59),
    summary:'Light on gameplay bonuses — mostly a research and cosmetic event this week.',
    highlight:'Mostly a cosmetic and research week — no major bonus multipliers, so don\'t rearrange your schedule around it.',
    bonuses:[ {glyph:'★',value:'Special',label:'Timed Research tied to Worlds'}, {glyph:'◆',value:'In person',label:'Bonus event XP on-site'} ],
    raidBosses:[], wildSpawns:[] }
];

module.exports.EVENTS = EVENTS;
