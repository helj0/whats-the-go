const { SlashCommandBuilder } = require('discord.js');
const { POKEMON, autocompleteChoices } = require('../data/roster');
const { baseEmbed, typeLine } = require('../utils/embeds');
const { isRateLimited } = require('../utils/rate-limit');
const db = require('../db');

const MAX_RELEASES_PER_WINDOW = 10;
const WINDOW_MS = 60 * 1000; // 1 minute — same budget as /catch

module.exports = {
  data: new SlashCommandBuilder()
    .setName('release')
    .setDescription('Remove a catch from your profile — undoes a /catch you logged by mistake')
    .addStringOption(opt =>
      opt.setName('pokemon').setDescription('Which one to release?').setRequired(true).setAutocomplete(true))
    .addBooleanOption(opt =>
      opt.setName('shiny').setDescription('Release the shiny catch instead of the regular one?').setRequired(false)),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused();
    await interaction.respond(autocompleteChoices(focused));
  },

  async execute(interaction) {
    if (isRateLimited(`release:${interaction.user.id}`, MAX_RELEASES_PER_WINDOW, WINDOW_MS)) {
      return interaction.reply({
        content: `Whoa, slow down! Max ${MAX_RELEASES_PER_WINDOW} releases per minute — give it a few seconds and try again.`,
        ephemeral: true,
      });
    }

    const id = interaction.options.getString('pokemon');
    const shiny = interaction.options.getBoolean('shiny') || false;
    const p = POKEMON[id];
    if (!p) {
      return interaction.reply({ content: "Couldn't find that species — pick one from the autocomplete list.", ephemeral: true });
    }

    // Removes the single most recently logged matching catch, regardless of which
    // event (or no event) it was tagged to — same "undo the last one" semantics as
    // /catch logging one. If it was tagged to a live event, this also un-checks it
    // in that event's interactive /events view and drops it from medal progress,
    // since both read from the same catches table.
    const removed = await db.removeMostRecentCatch(interaction.user.id, id, shiny);
    if (!removed) {
      return interaction.reply({
        content: `You haven't logged ${shiny ? 'a shiny ' : 'a '}${p.name} catch, so there's nothing to release.`,
        ephemeral: true,
      });
    }

    const embed = baseEmbed(`👋 Released ${p.name}`)
      .setDescription(`${shiny ? '✨ Shiny ' : ''}**${p.name}** removed from your profile.\n${typeLine(p.types)}`)
      .setColor(0x8FC0FF);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
