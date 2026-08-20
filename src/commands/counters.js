const { SlashCommandBuilder } = require('discord.js');
const { POKEMON, autocompleteChoices } = require('../data/roster');
const { bestCountersFor } = require('../utils/counters');
const { baseEmbed, typeLine } = require('../utils/embeds');

function buildCountersEmbed(target) {
  const results = bestCountersFor(target, 8);
  const embed = baseEmbed(`🎯 Best PVE Counters — ${target.name}`)
    .setDescription(`${typeLine(target.types)}\n\nRanked by attack type effectiveness, weighted by power level where we have real or estimated PVE data.`);

  if (results.length === 0) {
    embed.addFields({ name: 'No strong type counters found', value: "This species doesn't have a clean type weakness in this prototype's data — might just need raw power instead." });
    return embed;
  }

  embed.addFields({
    name: 'Top picks',
    value: results.map((c, i) => {
      const effLabel = c.effectiveness >= 2.5 ? '⬆️⬆️ double super-effective' : '⬆️ super-effective';
      const moveLabel = c.moveset ? ` — *${c.moveset.fast} + ${c.moveset.charge}*` : '';
      const sourceTag = c.source === 'verified' ? '✅' : c.source === 'estimated' ? '🔷' : '🔹';
      const formNote = c.form === 'Mega' ? ' _(only while its Mega Raid/boost is active)_' : '';
      return `**${i + 1}. ${c.displayName}** ${sourceTag}${moveLabel}${formNote}\n${effLabel}`;
    }).join('\n\n'),
  });

  embed.setFooter({
    text: '✅ verified from real game data · 🔷 estimated from known stats · 🔹 tier-band estimate only — not a full battle simulation.',
  });
  return embed;
}

module.exports = {
  buildCountersEmbed,
  data: new SlashCommandBuilder()
    .setName('counters')
    .setDescription('Best PVE counters against a species')
    .addStringOption(opt =>
      opt.setName('pokemon')
        .setDescription('The species you need counters for')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused();
    await interaction.respond(autocompleteChoices(focused));
  },

  async execute(interaction) {
    const id = interaction.options.getString('pokemon');
    const target = POKEMON[id];
    if (!target) {
      return interaction.reply({ content: "Couldn't find that species — try picking one from the autocomplete list.", ephemeral: true });
    }
    await interaction.reply({ embeds: [buildCountersEmbed(target)] });
  },
};
