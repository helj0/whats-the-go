const POKEMON = {
  venonat:{ id:'venonat', name:'Venonat', dex:48, types:['bug','poison'],
    description:'A fuzzy, night-loving insect whose oversized compound eyes can pick out the faintest movement in total darkness.',
    family:[{name:'Venonat',candy:0},{name:'Venomoth',candy:50}], megaSteps:[], specialEvolution:null,
    variants:[], hasShiny:true,
    
    pve:{standard:{available:false,note:'Evolve into Venomoth for battle use.'}, shadow:{available:false}, mega:{available:false}, legendary:{available:false}},
    rarity:{score:24,catchRate:'50%',fleeRate:'15%',movementType:'Jump',hatch:'Not available from eggs',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Venonat_(Pok%C3%A9mon)'
  },
  venomoth:{ id:'venomoth', name:'Venomoth', dex:49, types:['bug','poison'],
    description:'Once it sheds its fuzzy shell, this moth dusts the air with an irritating powder to keep predators at bay.',
    family:[{name:'Venonat',candy:0},{name:'Venomoth',candy:50}], megaSteps:[], specialEvolution:null,
    variants:[], hasShiny:true,
    
    pve:{standard:{available:true,tier:'C+',dpsBar:52,rank:18,fast:'Bug Bite',charge:'Sludge Bomb',note:'Usable Poison attacker in a pinch, well behind top options.'}, shadow:{available:false}, mega:{available:false}, legendary:{available:false}},
    rarity:{score:22,catchRate:'20%',fleeRate:'7%',movementType:'Flying',hatch:'Not available from eggs',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Venomoth_(Pok%C3%A9mon)'
  },
  fomantis:{ id:'fomantis', name:'Fomantis', dex:753, types:['grass'],
    description:'A plant-like Pokémon that soaks up sunlight all day, folding its leaf-blade arms in to rest once it sets.',
    family:[{name:'Fomantis',candy:0},{name:'Lurantis',candy:50}], megaSteps:[], specialEvolution:'Lurantis can only be evolved during the daytime.',
    variants:[], hasShiny:true,
    
    pve:{standard:{available:false,note:'Evolve into Lurantis for battle use.'}, shadow:{available:false}, mega:{available:false}, legendary:{available:false}},
    rarity:{score:26,catchRate:'40%',fleeRate:'10%',movementType:'Jump',hatch:'Not available from eggs',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Fomantis_(Pok%C3%A9mon)'
  },
  lurantis:{ id:'lurantis', name:'Lurantis', dex:754, types:['grass'],
    description:'Having fully bloomed, this Pokémon wields its petal-blades with surprising precision, disguising itself as a flower to lure in prey.',
    family:[{name:'Fomantis',candy:0},{name:'Lurantis',candy:50}], megaSteps:[], specialEvolution:'Must be evolved during the daytime — it will not evolve at night.',
    variants:[], hasShiny:true,
    
    pve:{standard:{available:true,tier:'C',dpsBar:49,rank:22,fast:'Bullet Seed',charge:'Leaf Blade',note:'A workable Grass attacker, well off the pace of top raid picks.'}, shadow:{available:false}, mega:{available:false}, legendary:{available:false}},
    rarity:{score:25,catchRate:'15%',fleeRate:'6%',movementType:'Jump',hatch:'Not available from eggs',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Lurantis_(Pok%C3%A9mon)'
  },
  nickit:{ id:'nickit', name:'Nickit', dex:827, types:['dark'],
    description:'A sly fox-like Pokémon that waves its fluffy tail as a decoy, letting it slip away with stolen food before anyone notices.',
    family:[{name:'Nickit',candy:0},{name:'Thievul',candy:50}], megaSteps:[], specialEvolution:null,
    variants:[], hasShiny:true,
    
    pve:{standard:{available:false,note:'Evolve into Thievul for battle use.'}, shadow:{available:false}, mega:{available:false}, legendary:{available:false}},
    rarity:{score:20,catchRate:'30%',fleeRate:'10%',movementType:'Jump',hatch:'Not available from eggs',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Nickit_(Pok%C3%A9mon)'
  },
  thievul:{ id:'thievul', name:'Thievul', dex:828, types:['dark'],
    description:"A cunning trickster that studies its target's daily routine for days before making off with their belongings without a trace.",
    family:[{name:'Nickit',candy:0},{name:'Thievul',candy:50}], megaSteps:[], specialEvolution:null,
    variants:[], hasShiny:true,
    
    pve:{standard:{available:true,tier:'C',dpsBar:53,rank:19,fast:'Snarl',charge:'Foul Play',note:'A fine budget Dark attacker, though far from top-tier raid DPS.'}, shadow:{available:false}, mega:{available:false}, legendary:{available:false}},
    rarity:{score:29,catchRate:'10%',fleeRate:'6%',movementType:'Jump',hatch:'Not available from eggs',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Thievul_(Pok%C3%A9mon)'
  },
  magikarp:{ id:'magikarp', name:'Magikarp', dex:129, types:['water'],
    description:'Nearly powerless on its own, this fish is best known as the humble first step toward one of the strongest raid attackers around.',
    family:[{name:'Magikarp',candy:0},{name:'Gyarados',candy:400}], megaSteps:[], specialEvolution:null,
    variants:[{label:'Dynamax Magikarp',shiny:true,note:'Joins the Max Battle rotation the week of Aug 17.'}], hasShiny:true,
    
    pve:{standard:{available:false,note:'Evolve into Gyarados for battle use.'}, shadow:{available:false}, mega:{available:false}, legendary:{available:false}},
    rarity:{score:6,catchRate:'70%',fleeRate:'15%',movementType:'None',hatch:'2 km egg pool',regional:false,exclusive:false,costume:true},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Magikarp_(Pok%C3%A9mon)'
  },
  gyarados:{ id:'gyarados', name:'Gyarados', dex:130, types:['water','flying'],
    description:'Once provoked, this serpentine giant becomes ferociously destructive — a striking transformation from its meek pre-evolution.',
    family:[{name:'Magikarp',candy:0},{name:'Gyarados',candy:400}],
    megaSteps:[{name:'Mega Gyarados',energyLabel:'Mega Energy',note:'Returns to Mega Raids on Aug 26.'}],
    specialEvolution:null,
    variants:[{label:'Mega Gyarados',shiny:true,note:'Returns to Mega Raids on Aug 26.'}], hasShiny:true,
    
    pve:{standard:{available:true,tier:'B',dpsBar:61,rank:12,fast:'Waterfall',charge:'Aqua Tail',note:'Usable Water attacker, outclassed by top-tier alternatives.'},
      shadow:{available:true,tier:'A',dpsBar:76,rank:6,fast:'Waterfall',charge:'Aqua Tail',note:'The Shadow bonus lifts it into respectable raid rotation.'},
      mega:{available:true,tier:'S',dpsBar:91,rank:2,fast:'Waterfall',charge:'Crunch',note:'Hits very hard with strong Water and Dark coverage moves.'}, legendary:{available:false}},
    rarity:{score:34,catchRate:'10%',fleeRate:'7%',movementType:'Hovering',hatch:'Not available from eggs',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Gyarados_(Pok%C3%A9mon)'
  },
  starmie:{ id:'starmie', name:'Starmie', dex:121, types:['water','psychic'],
    description:'A living gemstone sits at its core, pulsing with light as this starfish-shaped Pokémon spins gracefully through open water.',
    family:[{name:'Staryu',candy:0},{name:'Starmie',candy:40}],
    megaSteps:[{name:'Mega Starmie',energyLabel:'Mega Energy',note:'Featured in a dedicated Mega Raid Day on Aug 22.'}],
    specialEvolution:null,
    variants:[{label:'Mega Starmie',shiny:true,note:'Featured in a dedicated Mega Raid Day on Aug 22.'}], hasShiny:true,
    
    pve:{standard:{available:true,tier:'B',dpsBar:58,rank:15,fast:'Hidden Power',charge:'Hydro Pump',note:'Reasonable Water attacker without a Mega boost.'},
      shadow:{available:false},
      mega:{available:true,tier:'S',dpsBar:87,rank:3,fast:'Hidden Power',charge:'Hydro Pump',note:'Elite burst damage during its Mega window, especially vs Fire raids.'}, legendary:{available:false}},
    rarity:{score:39,catchRate:'20%',fleeRate:'6%',movementType:'Jump',hatch:'Not available from eggs',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Starmie_(Pok%C3%A9mon)'
  },
  garchomp:{ id:'garchomp', name:'Garchomp', dex:445, types:['dragon','ground'],
    description:'A jet-powered predator of the sand dunes, able to close the distance on prey faster than the eye can follow.',
    family:[{name:'Gible',candy:0},{name:'Gabite',candy:25},{name:'Garchomp',candy:100}],
    megaSteps:[{name:'Mega Garchomp',energyLabel:'Mega Energy',note:'In raids through Aug 18.'}],
    specialEvolution:null,
    variants:[{label:'Mega Garchomp',shiny:true,note:'In raids through Aug 18.'}], hasShiny:true,
    
    pve:{standard:{available:true,tier:'A',dpsBar:79,rank:5,fast:'Mud Shot',charge:'Earth Power',note:'One of the best non-Mega Ground attackers for raids.'},
      shadow:{available:false},
      mega:{available:true,tier:'S+',dpsBar:97,rank:1,fast:'Mud Shot',charge:'Earth Power',note:'Elite Ground/Dragon raid DPS during its Mega window.'}, legendary:{available:false}},
    rarity:{score:52,catchRate:'5%',fleeRate:'5%',movementType:'Jump',hatch:'10 km egg pool',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Garchomp_(Pok%C3%A9mon)'
  },
  groudon:{ id:'groudon', name:'Groudon', dex:383, types:['ground'],
    description:'A colossal Ground-type said to have reshaped continents in ancient times, radiating heat intense enough to evaporate rainclouds.',
    family:[{name:'Groudon',candy:0}],
    megaSteps:[{name:'Primal Groudon',energyLabel:'400 Primal Energy first, 80 after',note:'Temporary Primal Reversion, similar to a Mega Evolution.'}],
    specialEvolution:'Does not evolve through Candy.',
    variants:[], hasShiny:true,
    
    pve:{standard:{available:true,tier:'S',dpsBar:89,rank:2,fast:'Mud Shot',charge:'Precipice Blades',note:'A top-tier Ground raid attacker with a huge Attack stat.'}, shadow:{available:false}, mega:{available:false}, legendary:{available:true,tier:'S',dpsBar:89,rank:2,fast:'Mud Shot',charge:'Precipice Blades',note:'Currently active as a 5-star Legendary Raid boss.'}},
    rarity:{score:70,catchRate:'1.7%',fleeRate:'—',movementType:'Raid encounter',hatch:'Not available from eggs',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Groudon_(Pok%C3%A9mon)'
  },
  lunala:{ id:'lunala', name:'Lunala', dex:792, types:['psychic','ghost'],
    description:'A moonlit Legendary that drifts between dimensions, said to devour light itself when it spreads its wing-like membranes.',
    family:[{name:'Lunala',candy:0}], megaSteps:[], specialEvolution:'Does not evolve.',
    variants:[], hasShiny:true,
    
    pve:{standard:{available:true,tier:'A+',dpsBar:82,rank:4,fast:'Confusion',charge:'Moongeist Beam',note:'Excellent Psychic attacker; the Ghost typing adds useful coverage.'}, shadow:{available:false}, mega:{available:false}, legendary:{available:true,tier:'A+',dpsBar:82,rank:4,fast:'Confusion',charge:'Moongeist Beam',note:'Active as a 5-star raid boss — its shiny form debuts this window.'}},
    rarity:{score:74,catchRate:'~2%',fleeRate:'—',movementType:'Raid encounter',hatch:'Not available from eggs',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Lunala_(Pok%C3%A9mon)'
  },
  beldum:{ id:'beldum', name:'Beldum', dex:374, types:['steel','psychic'],
    description:'Held together by a powerful magnetic force, this Pokémon can barely move on its own but never gives up on reaching its goal.',
    family:[{name:'Beldum',candy:0},{name:'Metang',candy:25},{name:'Metagross',candy:100}], megaSteps:[], specialEvolution:null,
    variants:[], hasShiny:true,
    
    pve:{standard:{available:false,note:'Evolve into Metagross for battle use.'}, shadow:{available:false}, mega:{available:false}, legendary:{available:false}},
    rarity:{score:33,catchRate:'30%',fleeRate:'5%',movementType:'None',hatch:'10 km egg pool',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Beldum_(Pok%C3%A9mon)'
  },
  metang:{ id:'metang', name:'Metang', dex:375, types:['steel','psychic'],
    description:'Two magnetically fused bodies share a single mind, giving this Pokémon a kind of telepathy with its other half.',
    family:[{name:'Beldum',candy:0},{name:'Metang',candy:25},{name:'Metagross',candy:100}], megaSteps:[], specialEvolution:null,
    variants:[], hasShiny:true,
    
    pve:{standard:{available:false,note:'Not used as a raid attacker — evolve to Metagross.'}, shadow:{available:false}, mega:{available:false}, legendary:{available:false}},
    rarity:{score:36,catchRate:'20%',fleeRate:'6%',movementType:'Jump',hatch:'Not available from eggs',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Metang_(Pok%C3%A9mon)'
  },
  metagross:{ id:'metagross', name:'Metagross', dex:376, types:['steel','psychic'],
    description:'Four fused brains give this Pokémon supercomputer-level calculation speed, which it puts to devastating use in battle.',
    family:[{name:'Beldum',candy:0},{name:'Metang',candy:25},{name:'Metagross',candy:100}],
    megaSteps:[{name:'Mega Metagross',energyLabel:'Mega Energy',note:'One of the strongest Steel-type Mega raid attackers.'}],
    specialEvolution:null,
    variants:[{label:'Mega Metagross',shiny:true,note:'One of the strongest Steel-type Mega raid attackers.'}], hasShiny:true,
    
    pve:{standard:{available:true,tier:'A',dpsBar:80,rank:5,fast:'Bullet Punch',charge:'Meteor Mash',note:'A premier Steel-type raid attacker; Meteor Mash is an Elite TM move for best DPS.'},
      shadow:{available:false},
      mega:{available:true,tier:'S',dpsBar:93,rank:2,fast:'Bullet Punch',charge:'Meteor Mash',note:'Devastating Steel/Psychic damage during its Mega window.'}, legendary:{available:false}},
    rarity:{score:48,catchRate:'5%',fleeRate:'5%',movementType:'Jump',hatch:'Not available from eggs',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Metagross_(Pok%C3%A9mon)'
  },
  tyranitar:{ id:'tyranitar', name:'Tyranitar', dex:248, types:['rock','dark'],
    description:'A hulking Rock/Dark-type whose sheer power reshapes terrain as it moves — one of the most dependable raid attackers of its typing.',
    family:[{name:'Larvitar',candy:0},{name:'Pupitar',candy:25},{name:'Tyranitar',candy:100}],
    megaSteps:[{name:'Mega Tyranitar',energyLabel:'300 Mega Energy first, 60 after',note:'Temporary Mega Evolution boost, not a permanent form.'}],
    specialEvolution:null,
    variants:[], hasShiny:true,
    
    pve:{standard:{available:true,tier:'A',dpsBar:74,rank:6,fast:'Smack Down',charge:'Stone Edge',note:'Reliable Rock attacker with respectable bulk in raids.'},
      shadow:{available:true,tier:'S',dpsBar:88,rank:2,fast:'Smack Down',charge:'Stone Edge',note:'The Shadow bonus pushes DPS near the top of the Rock rankings.'},
      mega:{available:true,tier:'S+',dpsBar:96,rank:1,fast:'Bite',charge:'Stone Edge',note:'Mega-boosted Attack and Sand Stream synergy make this a top-tier raid pick.'}, legendary:{available:false}},
    rarity:{score:58,catchRate:'5%',fleeRate:'5%',movementType:'Jump',hatch:'Not available from eggs',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Tyranitar_(Pok%C3%A9mon)'
  },
  giratina:{ id:'giratina', name:'Giratina (Altered)', dex:487, types:['ghost','dragon'],
    description:'A Legendary said to reside in a distorted realm parallel to our own, appearing on our side only under rare circumstances.',
    family:[{name:'Giratina',candy:0}], megaSteps:[], specialEvolution:'Does not evolve through Candy.',
    variants:[{label:'Origin Forme',shiny:true,note:'Requires a Griseous item to switch from Altered Forme.'}], hasShiny:true,
    
    pve:{standard:{available:false,note:'Currently active only as a Shadow raid boss this month.'},
      shadow:{available:true,tier:'A',dpsBar:78,rank:5,fast:'Shadow Claw',charge:'Shadow Ball',note:'Strong Ghost attacker, boosted further by the Shadow bonus.'},
      mega:{available:false}, legendary:{available:true,tier:'A',dpsBar:78,rank:5,fast:'Shadow Claw',charge:'Shadow Ball',note:'Active as a 5-star Shadow Raid boss all month.'}},
    rarity:{score:63,catchRate:'~2%',fleeRate:'—',movementType:'Raid encounter',hatch:'Not available from eggs',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Giratina_(Pok%C3%A9mon)'
  },
  'necrozma-duskmane':{ id:'necrozma-duskmane', name:'Dusk Mane Necrozma', dex:800, types:['psychic','steel'],
    description:'A radiant being fused with a steel-clad steed, channeling blinding light through its armored, four-legged form.',
    family:[{name:'Necrozma',candy:0},{name:'Dusk Mane Necrozma',candy:0}], megaSteps:[],
    specialEvolution:'Formed by fusing Necrozma with Solgaleo — costs 1,000 Solar Fusion Energy, 30 Necrozma Candy, and 30 Cosmog Candy. Not a Candy evolution.',
    variants:[{label:'Dawn Wings Necrozma',shiny:true,note:'Alternate fusion — Necrozma with Lunala instead, same Fusion Energy cost.'}], hasShiny:true,
    
    pve:{standard:{available:true,tier:'S',dpsBar:86,rank:3,fast:'Metal Claw',charge:'Sunsteel Strike',note:'An extremely powerful Steel attacker off the back of a huge Attack stat.'}, shadow:{available:false}, mega:{available:false}, legendary:{available:true,tier:'S',dpsBar:86,rank:3,fast:'Metal Claw',charge:'Sunsteel Strike',note:'A high-DPS Legendary pick when available in raids.'}},
    rarity:{score:88,catchRate:'~2%',fleeRate:'—',movementType:'Raid / Special Research',hatch:'Not available from eggs',regional:false,exclusive:true,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Necrozma_(Pok%C3%A9mon)'
  },
  'kyurem-black':{ id:'kyurem-black', name:'Black Kyurem', dex:646, types:['dragon','ice'],
    description:'A hollow dragon fused with its aggressive counterpart, gaining explosive power at the cost of stability.',
    family:[{name:'Kyurem',candy:0},{name:'Black Kyurem',candy:0}], megaSteps:[],
    specialEvolution:'Formed by fusing Kyurem with Zekrom — costs 1,000 Volt Fusion Energy, 30 Kyurem Candy, and 30 Zekrom Candy. Not a Candy evolution.',
    variants:[{label:'White Kyurem',shiny:true,note:'Alternate fusion — Kyurem with Reshiram instead, using Blaze Fusion Energy.'}], hasShiny:true,
    
    pve:{standard:{available:true,tier:'S',dpsBar:85,rank:4,fast:'Dragon Breath',charge:'Freeze Shock',note:'Strong Ice attacker; Elite TM move needed for best DPS.'}, shadow:{available:false}, mega:{available:false}, legendary:{available:true,tier:'S',dpsBar:85,rank:4,fast:'Dragon Breath',charge:'Freeze Shock',note:'A top Ice-type pick when available in raids.'}},
    rarity:{score:85,catchRate:'~2%',fleeRate:'—',movementType:'Raid / Special Research',hatch:'Not available from eggs',regional:false,exclusive:true,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Kyurem_(Pok%C3%A9mon)'
  },
  zacian:{ id:'zacian', name:'Zacian (Crowned Sword)', dex:888, types:['fairy','steel'],
    description:'A regal wolf-like Legendary that channels a blade-shaped aura, said to have cut down anything that threatened the ancient kingdom it protected.',
    family:[{name:'Zacian (Hero of Many Battles)',candy:0},{name:'Zacian (Crowned Sword)',candy:'Rusted Sword'}], megaSteps:[],
    specialEvolution:'Switches to Crowned Sword form using a Rusted Sword item — a form change, not a Candy evolution.',
    variants:[], hasShiny:true,
    
    pve:{standard:{available:true,tier:'S',dpsBar:90,rank:2,fast:'Snarl',charge:'Behemoth Blade',note:'Elite Fairy-type raid attacker with a massive Attack stat.'}, shadow:{available:false}, mega:{available:false}, legendary:{available:true,tier:'S',dpsBar:90,rank:2,fast:'Snarl',charge:'Behemoth Blade',note:'A top-tier Legendary pick whenever it appears in raids.'}},
    rarity:{score:78,catchRate:'~2%',fleeRate:'—',movementType:'Research encounter',hatch:'Not available from eggs',regional:false,exclusive:true,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Zacian_(Pok%C3%A9mon)'
  },
  dialga:{ id:'dialga', name:'Dialga', dex:483, types:['steel','dragon'],
    description:'A Legendary said to govern the flow of time itself, its steel body said to be forged from the fabric of a parallel dimension.',
    family:[{name:'Dialga',candy:0}], megaSteps:[], specialEvolution:'Does not evolve.',
    variants:[{label:'Origin Forme',shiny:true,note:'Requires an Adamant item to switch from base Dialga.'}], hasShiny:true,
    
    pve:{standard:{available:true,tier:'S',dpsBar:88,rank:2,fast:'Dragon Breath',charge:'Roar of Time',note:'One of the best Steel-type raid attackers in the game.'}, shadow:{available:false}, mega:{available:false}, legendary:{available:true,tier:'S',dpsBar:88,rank:2,fast:'Dragon Breath',charge:'Roar of Time',note:'A top pick whenever active as a raid boss.'}},
    rarity:{score:76,catchRate:'~2%',fleeRate:'—',movementType:'Raid encounter',hatch:'Not available from eggs',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Dialga_(Pok%C3%A9mon)'
  },
  lugia:{ id:'lugia', name:'Lugia', dex:249, types:['psychic','flying'],
    description:'A guardian Legendary said to slumber at the bottom of the sea, capable of stirring hurricanes with a single wingbeat.',
    family:[{name:'Lugia',candy:0}], megaSteps:[], specialEvolution:'Does not evolve.',
    variants:[], hasShiny:true,
    
    pve:{standard:{available:true,tier:'A',dpsBar:75,rank:8,fast:'Extrasensory',charge:'Future Sight',note:'More of a defensive wall than a top attacker, but still respectable.'}, shadow:{available:false}, mega:{available:false}, legendary:{available:true,tier:'A',dpsBar:75,rank:8,fast:'Extrasensory',charge:'Future Sight',note:'A serviceable pick when active as a raid boss.'}},
    rarity:{score:72,catchRate:'~2%',fleeRate:'—',movementType:'Raid encounter',hatch:'Not available from eggs',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Lugia_(Pok%C3%A9mon)'
  },
  mewtwo:{ id:'mewtwo', name:'Mewtwo', dex:150, types:['psychic'],
    description:'A genetically engineered Pokémon whose raw psychic power is said to rival that of the Legendaries it was created to surpass.',
    family:[{name:'Mewtwo',candy:0}], megaSteps:[], specialEvolution:'Does not evolve.',
    variants:[{label:'Armored Mewtwo',shiny:false,note:'Alternate research-only appearance with different stats. Not yet released as shiny.'}], hasShiny:true,
    
    pve:{standard:{available:true,tier:'A+',dpsBar:83,rank:3,fast:'Confusion',charge:'Psystrike',note:'A premier Psychic attacker with a huge Attack stat.'}, shadow:{available:false}, mega:{available:false}, legendary:{available:true,tier:'A+',dpsBar:83,rank:3,fast:'Confusion',charge:'Psystrike',note:'A top pick whenever active as a raid boss.'}},
    rarity:{score:80,catchRate:'~2%',fleeRate:'—',movementType:'Raid / Research encounter',hatch:'Not available from eggs',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Mewtwo_(Pok%C3%A9mon)'
  },
  excadrill:{ id:'excadrill', name:'Excadrill', dex:530, types:['ground','steel'],
    description:'A subterranean digger whose drill-like claws can tunnel through solid rock as easily as loose soil.',
    family:[{name:'Drilbur',candy:0},{name:'Excadrill',candy:50}], megaSteps:[], specialEvolution:'Requires a Unova Stone in addition to 50 Candy.',
    variants:[], hasShiny:true,
    
    pve:{standard:{available:true,tier:'A',dpsBar:81,rank:4,fast:'Mud-Slap',charge:'Drill Run',note:'One of the strongest non-Mega Ground raid attackers.'}, shadow:{available:false}, mega:{available:false}, legendary:{available:false}},
    rarity:{score:30,catchRate:'20%',fleeRate:'6%',movementType:'None',hatch:'Not available from eggs',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Excadrill_(Pok%C3%A9mon)'
  },
  togekiss:{ id:'togekiss', name:'Togekiss', dex:468, types:['fairy','flying'],
    description:'A radiant, blessing-bringing Pokémon said to appear only before kind-hearted people, gliding on wings that never seem to tire.',
    family:[{name:'Togepi',candy:0},{name:'Togetic',candy:25},{name:'Togekiss',candy:100}], megaSteps:[], specialEvolution:'Requires a Sinnoh Stone in addition to 100 Candy.',
    variants:[], hasShiny:true,
    
    pve:{standard:{available:false,note:'Not a strong raid pick — its stats favor bulk and support over raw damage output.'}, shadow:{available:false}, mega:{available:false}, legendary:{available:false}},
    rarity:{score:28,catchRate:'20%',fleeRate:'5%',movementType:'Flying',hatch:'Not available from eggs',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Togekiss_(Pok%C3%A9mon)'
  },
  swampert:{ id:'swampert', name:'Swampert', dex:260, types:['water','ground'],
    description:'A sturdy, amphibious Pokémon whose powerful limbs let it plow through mud, rock, and rough surf with equal ease.',
    family:[{name:'Mudkip',candy:0},{name:'Marshtomp',candy:25},{name:'Swampert',candy:100}],
    megaSteps:[{name:'Mega Swampert',energyLabel:'Mega Energy',note:'One of the best Water-type Mega raid attackers.'}],
    specialEvolution:null,
    variants:[{label:'Mega Swampert',shiny:true,note:'One of the best Water-type Mega raid attackers.'}], hasShiny:true,
    
    pve:{standard:{available:true,tier:'B',dpsBar:60,rank:14,fast:'Mud Shot',charge:'Earthquake',note:'A reliable Ground/Water attacker without a Mega boost.'},
      shadow:{available:false},
      mega:{available:true,tier:'S',dpsBar:90,rank:2,fast:'Water Gun',charge:'Hydro Cannon',note:'Elite Water raid DPS during its Mega window.'}, legendary:{available:false}},
    rarity:{score:20,catchRate:'20%',fleeRate:'6%',movementType:'Jump',hatch:'Not available from eggs',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Swampert_(Pok%C3%A9mon)'
  },
  sylveon:{ id:'sylveon', name:'Sylveon', dex:700, types:['fairy'],
    description:'An Eevee-kin that soothes the feelings of anyone nearby by wrapping them in its ribbon-like feelers, said to channel a gentle, calming energy.',
    family:[{name:'Eevee',candy:0},{name:'Sylveon',candy:25}], megaSteps:[],
    specialEvolution:"Evolve Eevee as your Buddy at Great Buddy affection while it knows a Fairy-type move — or use the 'Kira' nickname trick.",
    variants:[], hasShiny:true,
    
    pve:{standard:{available:false,note:'Not a strong raid pick — well below top Fairy raid attackers on damage output.'}, shadow:{available:false}, mega:{available:false}, legendary:{available:false}},
    rarity:{score:15,catchRate:'40%',fleeRate:'10%',movementType:'Jump',hatch:'Not available from eggs',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Sylveon_(Pok%C3%A9mon)'
  },
  azumarill:{ id:'azumarill', name:'Azumarill', dex:184, types:['water','fairy'],
    description:'A round, buoyant Pokémon that uses its rabbit-like ears as makeshift flotation aids while paddling through rivers and lakes.',
    family:[{name:'Azurill',candy:0},{name:'Marill',candy:25},{name:'Azumarill',candy:100}], megaSteps:[], specialEvolution:null,
    variants:[], hasShiny:true,
    
    pve:{standard:{available:false,note:'Not a strong raid pick — its raid DPS is well below dedicated Water attackers.'}, shadow:{available:false}, mega:{available:false}, legendary:{available:false}},
    rarity:{score:12,catchRate:'50%',fleeRate:'10%',movementType:'Jump',hatch:'Not available from eggs',regional:false,exclusive:false,costume:true},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Azumarill_(Pok%C3%A9mon)'
  },
  registeel:{ id:'registeel', name:'Registeel', dex:379, types:['steel'],
    description:'An ancient, metal-bodied guardian said to have been forged rather than born, standing motionless in buried ruins for centuries at a time.',
    family:[{name:'Registeel',candy:0}], megaSteps:[], specialEvolution:'Does not evolve.',
    variants:[], hasShiny:true,
    
    pve:{standard:{available:true,tier:'B',dpsBar:55,rank:16,fast:'Metal Claw',charge:'Flash Cannon',note:'More of a defensive gym-holder than a raid attacker.'}, shadow:{available:false}, mega:{available:false}, legendary:{available:true,tier:'B',dpsBar:55,rank:16,fast:'Metal Claw',charge:'Flash Cannon',note:'Usable when active as a raid boss, though not top-tier DPS.'}},
    rarity:{score:73,catchRate:'~2%',fleeRate:'—',movementType:'Raid encounter',hatch:'Not available from eggs',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Registeel_(Pok%C3%A9mon)'
  },
  dragonite:{ id:'dragonite', name:'Dragonite', dex:149, types:['dragon','flying'],
    description:'A gentle giant despite its power, said to guide lost sailors home by carrying them across the sea on its back.',
    family:[{name:'Dratini',candy:0},{name:'Dragonair',candy:25},{name:'Dragonite',candy:100}], megaSteps:[], specialEvolution:null,
    variants:[], hasShiny:true,
    
    pve:{standard:{available:true,tier:'A-',dpsBar:70,rank:9,fast:'Dragon Breath',charge:'Outrage',note:'A dependable Dragon attacker, just off the pace of the top picks.'}, shadow:{available:false}, mega:{available:false}, legendary:{available:false}},
    rarity:{score:35,catchRate:'5%',fleeRate:'5%',movementType:'Flying',hatch:'10 km egg pool',regional:false,exclusive:false,costume:false},
    bulbapedia:'https://bulbapedia.bulbagarden.net/wiki/Dragonite_(Pok%C3%A9mon)'
  }
};

module.exports.POKEMON = POKEMON;
