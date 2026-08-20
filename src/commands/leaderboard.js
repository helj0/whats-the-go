const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../utils/embeds');
const db = require('../db');

const RANK_ICON = ['🥇', '🥈', '🥉'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('See the top collectors in this server \u2014 friendly competition!'),

  async execute(interaction) {
    await interaction.deferReply();

    // Catches aren't stored per-guild, so rank globally by catch count and
    // filter down to this server's members as we go (fetching individual
    // members by ID works fine without the privileged GuildMembers intent).
    const topGlobal = await db.getTopCollectors(50);
    const inGuild = [];
    for (const row of topGlobal) {
      try {
        const member = await interaction.guild.members.fetch(row.user_id);
        inGuild.push({ ...row, displayName: member.displayName || member.user.username });
        if (inGuild.length >= 10) break;
      } catch {
        // not a member of this guild (or left) \u2014 skip
      }
    }

    if (inGuild.length === 0) {
      return interaction.editReply({
        embeds: [baseEmbed('🏆 Collector Leaderboard').setDescription("No one in this server has logged a catch yet \u2014 be the first with `/catch`!")],
      });
    }

    const embed = baseEmbed('🏆 Collector Leaderboard')
      .setDescription(`Friendly competition \u2014 top ${inGuild.length} trainer${inGuild.length > 1 ? 's' : ''} in this server by catches logged:`);

    embed.addFields({
      name: 'Top Collectors',
      value: inGuild.map((r, i) => {
        const rank = RANK_ICON[i] || `#${i + 1}`;
        return `${rank} **${r.displayName}** \u2014 ${r.total} catches \u00b7 ${r.unique_species} species \u00b7 ${r.shinies} shiny`;
      }).join('\n'),
    });

    embed.setFooter({ text: "What's the GO? 🐾 \u00b7 keep catching to climb the board! \u00b7 unofficial fan project" });

    await interaction.editReply({ embeds: [embed] });
  },
};
