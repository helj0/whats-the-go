const { SlashCommandBuilder } = require('discord.js');
const { POKEMON, autocompleteChoices } = require('../data/roster');
const { liveEvents } = require('../utils/event-helpers');
const { baseEmbed, typeLine } = require('../utils/embeds');
const db = require('../db');

// If the species is a featured wild spawn or raid boss of a currently-live
// event, auto-tag the catch with that event so it counts toward completion.
function findLiveEventFor(pokemonId) {
  for (const ev of liveEvents()) {
    const isSpawn = (ev.wildSpawns || []).includes(pokemonId);
    const isBoss = (ev.raidBosses || []).some(rb => rb.id === pokemonId);
    if (isSpawn || isBoss) return ev;
  }
  return null;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('catch')
    .setDescription('Log a catch to your profile')
    .addStringOption(opt =>
      opt.setName('pokemon').setDescription('What did you catch?').setRequired(true).setAutocomplete(true))
    .addBooleanOption(opt =>
      opt.setName('shiny').setDescription('Was it shiny?').setRequired(false))
    .addIntegerOption(opt =>
      opt.setName('cp').setDescription('CP (optional, add it now or skip)').setRequired(false)),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused();
    await interaction.respond(autocompleteChoices(focused));
  },

  async execute(interaction) {
    const id = interaction.options.getString('pokemon');
    const shiny = interaction.options.getBoolean('shiny') || false;
    const cp = interaction.options.getInteger('cp');
    const p = POKEMON[id];
    if (!p) {
      return interaction.reply({ content: "Couldn't find that species — pick one from the autocomplete list.", ephemeral: true });
    }

    const ev = findLiveEventFor(id);
    await db.addCatch(interaction.user.id, id, { shiny, cp, eventId: ev ? ev.id : null });

    const embed = baseEmbed(`${shiny ? '✨ Shiny caught!' : '🎾 Caught!'}`)
      .setDescription(`**${p.name}**${cp ? ` · CP ${cp}` : ''}\n${typeLine(p.types)}`)
      .setColor(shiny ? 0xFFD666 : 0x5CEBA8);
    if (ev) embed.addFields({ name: 'Tagged to event', value: ev.title });

    await interaction.reply({ embeds: [embed] });
  },
};
