const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { baseEmbed } = require('../utils/embeds');
const { discordTimestamp } = require('../utils/event-helpers');
const { getStatus } = require('../data/live-events');
const db = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('(Admin) Configure this server\'s event announcements')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub =>
      sub.setName('channel').setDescription('Set the channel where event announcements get posted')
        .addChannelOption(opt =>
          opt.setName('channel').setDescription('Text channel for announcements')
            .addChannelTypes(ChannelType.GuildText).setRequired(true)))
    .addSubcommand(sub => sub.setName('status').setDescription('Show current settings for this server')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'channel') {
      const channel = interaction.options.getChannel('channel');
      await db.setGuildEventChannel(interaction.guild.id, channel.id);
      return interaction.reply({
        embeds: [baseEmbed('✅ Announcements configured').setDescription(`Event pushes will now post in ${channel}.`)],
        ephemeral: true,
      });
    }

    // status
    const settings = await db.getGuildSettings(interaction.guild.id);
    const liveStatus = getStatus();
    const embed = baseEmbed('⚙️ Server Settings').setDescription(
      settings && settings.event_channel_id
        ? `Announcements post to <#${settings.event_channel_id}>.`
        : 'No announcement channel set yet \u2014 run `/setup channel` to pick one.'
    );
    embed.addFields({
      name: '📡 Event data source',
      value: liveStatus.usingFallback
        ? `⚠️ Running on static fallback data (${liveStatus.eventCount} events) \u2014 live fetch from ScrapedDuck ${liveStatus.lastFetchError ? 'failed: ' + liveStatus.lastFetchError : "hasn't succeeded yet"}.`
        : `✅ Live data from ScrapedDuck (${liveStatus.eventCount} events), last refreshed ${liveStatus.lastFetchTime ? discordTimestamp(liveStatus.lastFetchTime.getTime(), 'R') : 'never'}.`,
    });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
