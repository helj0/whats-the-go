const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { currentRaidBosses } = require('../utils/event-helpers');
const { POKEMON } = require('../data/roster');
const { baseEmbed, typeLine, addListField } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('raids')
    .setDescription('See current raid bosses across all live events'),

  async execute(interaction) {
    const bosses = currentRaidBosses();
    const embed = baseEmbed('⚔️ Current Raid Bosses');

    if (bosses.length === 0) {
      embed.setDescription('No raid bosses tied to a live event right now.');
      return interaction.reply({ embeds: [embed] });
    }

    const entries = bosses.map(rb => {
      const p = POKEMON[rb.id];
      if (!p) return null;
      return '**' + p.name + '** — ' + rb.tierLabel + '\n' + typeLine(p.types) + '\n_' + rb.note + '_ · from *' + rb.eventTitle + '*';
    }).filter(Boolean);
    addListField(embed, '⚔️ Bosses', entries);

    // Quick-jump buttons to check counters for the top 3 bosses (Discord caps rows at 5 buttons)
    const top = bosses.slice(0, 3).map(rb => POKEMON[rb.id]).filter(Boolean);
    const row = new ActionRowBuilder().addComponents(
      top.map(p => new ButtonBuilder()
        .setCustomId(`counters:${p.id}`)
        .setLabel(`Counters for ${p.name}`)
        .setStyle(ButtonStyle.Primary))
    );

    await interaction.reply({ embeds: [embed], components: top.length ? [row] : [] });
  },
};
