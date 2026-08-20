const { SlashCommandBuilder } = require('discord.js');
const { currentWildSpawns } = require('../utils/event-helpers');
const { POKEMON } = require('../data/roster');
const { baseEmbed, typeLine, addListField } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spawns')
    .setDescription('See current event wild spawns'),

  async execute(interaction) {
    const spawns = currentWildSpawns();
    const embed = baseEmbed('🌿 Current Event Spawns');

    if (spawns.length === 0) {
      embed.setDescription('No boosted wild spawns from a live event right now.');
      return interaction.reply({ embeds: [embed] });
    }

    const entries = spawns.map(s => {
      const p = POKEMON[s.id];
      if (!p) return null;
      return '**' + p.name + '**' + (p.hasShiny ? ' ✨' : '') + '\n' + typeLine(p.types) + ' · from *' + s.eventTitle + '*';
    }).filter(Boolean);
    addListField(embed, '🌿 Spawns', entries);
    embed.setFooter({ text: '✨ = shiny available for this species · unofficial fan project' });

    await interaction.reply({ embeds: [embed] });
  },
};
