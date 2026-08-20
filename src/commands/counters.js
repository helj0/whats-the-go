const { SlashCommandBuilder } = require('discord.js');
const { POKEMON, autocompleteChoices } = require('../data/roster');
const { bestCountersFor } = require('../utils/counters');
const { baseEmbed, typeLine, addListField, speciesThumbnailAttachment } = require('../utils/embeds');
const { TYPE_EMOJI } = require('../data/types');

const METER_LENGTH = 5;
// Bars are relative to the strongest pick shown, not an absolute DPS scale — mixing
// real eDPS numbers with tier-fallback scores (see utils/counters.js) means there's
// no single honest absolute unit to bar against, but "how this stacks up against the
// best option here" is still a meaningful, non-fabricated comparison.
function powerMeter(score, maxScore) {
  const filled = Math.max(1, Math.round((score / maxScore) * METER_LENGTH));
  return '▰'.repeat(filled) + '▱'.repeat(METER_LENGTH - filled);
}

function buildCountersEmbed(target) {
  const results = bestCountersFor(target, 8);
  const embed = baseEmbed(`🎯 Best PVE Counters — ${target.name}`)
    .setDescription(`${typeLine(target.types)}\n\nRanked by attack type effectiveness, weighted by power level where we have real or estimated PVE data.`);

  const thumb = speciesThumbnailAttachment(target.types[0]);
  embed.setThumbnail(thumb.thumbnailUrl);

  if (results.length === 0) {
    embed.addFields({ name: 'No strong type counters found', value: "This species doesn't have a clean type weakness in this prototype's data — might just need raw power instead." });
    return { embed, files: thumb.files };
  }

  const maxScore = results[0].score;
  const entries = results.map((c, i) => {
    const typePrefix = c.pokemon.types.map(t => TYPE_EMOJI[t] || '').join('');
    const moveLabel = c.moveset ? ` — *${c.moveset.fast} + ${c.moveset.charge}*` : '';
    const sourceTag = c.source === 'verified' ? '✅' : c.source === 'estimated' ? '🔷' : '🔹';
    const formNote = c.form === 'Mega' ? ' _(only while its Mega Raid/boost is active)_' : '';
    return `**${i + 1}. ${typePrefix} ${c.displayName}** ${sourceTag}${moveLabel}${formNote}\n${powerMeter(c.score, maxScore)}`;
  });
  addListField(embed, 'Top picks', entries);

  embed.setFooter({
    text: '✅ verified from real game data · 🔷 estimated from known stats · 🔹 tier-band estimate only — not a full battle simulation.',
  });
  return { embed, files: thumb.files };
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
    const { embed, files } = buildCountersEmbed(target);
    await interaction.reply({ embeds: [embed], files });
  },
};
