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
    name: '⚔️ Battling',
    lines: [
      '`/counters <pokemon>` — best PVE counters for a species',
    ],
  },
  {
    name: '🎒 Your collection',
    lines: [
      '`/catch <pokemon> [shiny] [cp]` — log a catch (auto-tags to a live event if it\'s featured)',
      '`/profile view [trainer]` — see your profile, or someone else\'s',
      '`/profile edit` — set your name, level, bio, buddy',
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
      .setDescription("Your Pokémon GO companion, right here in Discord. Here's everything I can do:");
    for (const section of SECTIONS) {
      embed.addFields({ name: section.name, value: section.lines.join('\n') });
    }
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
