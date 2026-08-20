const { SlashCommandBuilder } = require('discord.js');
const { liveEvents } = require('../utils/event-helpers');
const { recommendItems } = require('../utils/recommendations');
const { baseEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bonuses')
    .setDescription('Current event bonuses, plus item recommendations (Star Piece / Lucky Egg / Incense)'),

  async execute(interaction) {
    const live = liveEvents();
    const embed = baseEmbed('✨ Current Event Bonuses');

    if (live.length === 0) {
      embed.setDescription('No event bonuses active right now.');
      return interaction.reply({ embeds: [embed] });
    }

    for (const ev of live) {
      const bonusText = ev.bonuses.map(b => `${b.glyph} **${b.value}** \u2014 ${b.label}`).join('\n');
      const recs = recommendItems(ev);
      const recText = recs.length
        ? recs.map(r => `${r.emoji} **${r.item}** \u2014 ${r.why}`).join('\n')
        : '_No standout item recommendation for this one \u2014 the bonuses don\u2019t clearly favor Star Piece, Lucky Egg, or Incense._';

      embed.addFields(
        { name: ev.title, value: bonusText },
        { name: '🎒 Worth using', value: recText },
      );
    }

    await interaction.reply({ embeds: [embed] });
  },
};
