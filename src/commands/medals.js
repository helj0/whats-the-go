const { SlashCommandBuilder } = require('discord.js');
const { getEvents } = require('../data/live-events');
const { eventMedalStatus } = require('../utils/medals');
const { baseEmbed } = require('../utils/embeds');

const MEDAL_ICON = { platinum: '💠', gold: '🥇', locked: '⬜' };
const MEDAL_LABEL = { platinum: 'Platinum', gold: 'Gold', locked: 'Locked' };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('medals')
    .setDescription('See event completion medals — yours, or a friend\'s')
    .addUserOption(opt =>
      opt.setName('trainer').setDescription('Whose medals? (defaults to you)').setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply();
    const targetUser = interaction.options.getUser('trainer') || interaction.user;

    const events = getEvents();
    const results = [];
    for (const ev of events) {
      const status = await eventMedalStatus(targetUser.id, ev);
      if (status.species.length > 0) results.push({ ev, status });
    }

    if (results.length === 0) {
      return interaction.editReply({
        embeds: [baseEmbed('🏅 Medals').setDescription('No events with catchable species right now \u2014 check back once something\'s live!')],
      });
    }

    const goldOrBetter = results.filter(r => r.status.medal === 'gold' || r.status.medal === 'platinum').length;
    const platinumCount = results.filter(r => r.status.medal === 'platinum').length;

    const embed = baseEmbed(`🏅 ${targetUser.username}'s Medals`)
      .setDescription(`${goldOrBetter} of ${results.length} events at Gold or better \u00b7 ${platinumCount} Platinum`);

    for (const { ev, status } of results) {
      const icon = MEDAL_ICON[status.medal];
      const label = MEDAL_LABEL[status.medal];
      const detail = status.medal === 'locked'
        ? `${status.baseDone}/${status.baseTotal} caught`
        : status.medal === 'gold'
          ? (status.shinyTotal ? `${status.shinyDone}/${status.shinyTotal} shinies to Platinum` : 'All caught!')
          : 'Fully completed \u2014 shinies included!';
      embed.addFields({ name: `${icon} ${ev.title}`, value: `${label} \u2014 ${detail}` });
    }

    embed.addFields({
      name: 'How medals work',
      value: 'Catch every featured species from an event (`/catch` auto-tags it if the event is live) for Gold. Catch their shinies too, where available, for Platinum.',
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
