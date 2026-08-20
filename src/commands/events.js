const { SlashCommandBuilder } = require('discord.js');
const { liveEvents, upcomingEvents, formatCountdown, formatRange } = require('../utils/event-helpers');
const { baseEmbed, typeColorInt } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('events')
    .setDescription('See what\'s live and what\'s coming up in Pokémon GO right now'),

  async execute(interaction) {
    const live = liveEvents();
    const upcoming = upcomingEvents();

    const embed = baseEmbed('🎉 Current Events');
    if (live.length === 0 && upcoming.length === 0) {
      embed.setDescription("Nothing on the calendar right now — check back soon!");
    } else {
      if (live.length) {
        embed.addFields({
          name: '🟢 Live now',
          value: live.map(ev => `**${ev.title}**\nEnds in ${formatCountdown(ev.end - Date.now())} · ${formatRange(ev)}`).join('\n\n'),
        });
      }
      if (upcoming.length) {
        embed.addFields({
          name: '🔜 On deck',
          value: upcoming.map(ev => `**${ev.title}**\nStarts in ${formatCountdown(ev.start - Date.now())} · ${formatRange(ev)}`).join('\n\n'),
        });
      }
    }
    if (live[0]) embed.setColor(typeColorInt(live[0].colorTypes && live[0].colorTypes.length ? live[0].colorTypes : ['normal']));

    await interaction.reply({ embeds: [embed] });
  },
};
