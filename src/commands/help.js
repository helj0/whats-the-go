const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../utils/embeds');

const SECTIONS = [
  {
    name: '📅 Events & raids',
    lines: [
      '`/events` — live and upcoming events',
      '`/raids` — current raid bosses, with quick-jump buttons to counters',
      '`/spawns` — current event wild spawns',
      '`/bonuses` — current event bonuses + item recommendations',
    ],
  },
  {
    name: '⚔️ Raid counters',
    lines: [
      '`/counters <pokemon>` — best PVE counters for a raid boss',
    ],
  },
  {
    name: '🎒 Your collection',
    lines: [
      '`/catch <pokemon> [shiny] [cp]` — log a catch (auto-tags to a live event if it\'s featured)',
      '`/release <pokemon> [shiny]` — remove a catch you logged by mistake',
      '`/profile view [trainer]` — see your profile, or a friend\'s',
      '`/profile edit` — set your name, level, bio, buddy',
    ],
  },
  {
    name: '🏅 Friendly competition',
    lines: [
      '`/medals [trainer]` — event completion medals, yours or a friend\'s',
      '`/leaderboard` — top collectors in this server',
    ],
  },
  {
    name: '⚙️ Server admin',
    lines: [
      '`/setup channel #channel` — set where event announcements post',
      '`/setup status` — check current settings',
    ],
  },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('See everything this bot can do'),

  async execute(interaction) {
    const embed = baseEmbed("🐾 What's the GO? Buddy — Commands")
      .setDescription("Your PVE Pokémon GO companion \u2014 events, raid counters, and friendly collecting with your server. Here's everything I can do:");
    for (const section of SECTIONS) {
      embed.addFields({ name: section.name, value: section.lines.join('\n') });
    }
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
