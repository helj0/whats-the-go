const { SlashCommandBuilder } = require('discord.js');
const { buildEventListView } = require('../utils/event-view');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('events')
    .setDescription('See what\'s live and what\'s coming up in Pokémon GO right now'),

  async execute(interaction) {
    const view = await buildEventListView();
    await interaction.reply(view);
  },
};
