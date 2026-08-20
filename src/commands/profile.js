const { SlashCommandBuilder } = require('discord.js');
const { POKEMON, autocompleteChoices } = require('../data/roster');
const { TYPE_LIST } = require('../data/types');
const { baseEmbed, typeColorInt, typeBannerAttachment } = require('../utils/embeds');
const db = require('../db');

// Slash command choice labels only ever render as plain text — Discord doesn't
// parse custom emoji syntax there, so this stays plain (unlike typeLine() in
// embeds.js, which shows the real custom emoji since that's real message content).
const COLOR_CHOICES = TYPE_LIST.map(t => ({ name: t.charAt(0).toUpperCase() + t.slice(1), value: t }));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription("View your trainer profile, or a friend's")
    .addSubcommand(sub =>
      sub.setName('view').setDescription("View a trainer's profile")
        .addUserOption(opt => opt.setName('trainer').setDescription('Whose profile? (defaults to you)').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('edit').setDescription('Edit your own profile')
        .addStringOption(opt => opt.setName('name').setDescription('Trainer name').setRequired(false))
        .addIntegerOption(opt => opt.setName('level').setDescription('Trainer level').setRequired(false))
        .addStringOption(opt => opt.setName('bio').setDescription('Short bio').setRequired(false))
        .addStringOption(opt =>
          opt.setName('buddy').setDescription('Buddy species — start typing to search, no need to have caught it')
            .setRequired(false).setAutocomplete(true))
        .addStringOption(opt =>
          opt.setName('colour').setDescription("Profile colour, matched to a type's colour")
            .setRequired(false).addChoices(...COLOR_CHOICES))),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused();
    await interaction.respond(autocompleteChoices(focused));
  },

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'edit') {
      const fields = {};
      const name = interaction.options.getString('name');
      const level = interaction.options.getInteger('level');
      const bio = interaction.options.getString('bio');
      const buddy = interaction.options.getString('buddy');
      const colour = interaction.options.getString('colour');
      if (name !== null) fields.trainer_name = name;
      if (level !== null) fields.level = level;
      if (bio !== null) fields.bio = bio;
      if (buddy !== null) {
        // Any species in the roster is a valid buddy — Pokémon GO doesn't require
        // catching a species before setting it as your buddy, and neither do we.
        if (!POKEMON[buddy]) {
          return interaction.reply({ content: "Couldn't find that species — pick one from the autocomplete list.", ephemeral: true });
        }
        fields.buddy_pokemon_id = buddy;
      }
      if (colour !== null) fields.profile_color = colour;
      await db.upsertTrainer(interaction.user.id, fields);
      return interaction.reply({ content: '✅ Profile updated!', ephemeral: true });
    }

    // view
    const targetUser = interaction.options.getUser('trainer') || interaction.user;
    const trainer = await db.getTrainer(targetUser.id);
    const counts = await db.getCatchCounts(targetUser.id);
    const recent = await db.getRecentCatches(targetUser.id, 8);

    const embed = baseEmbed(`🎽 ${trainer?.trainer_name || targetUser.username}'s Profile`)
      .setThumbnail(targetUser.displayAvatarURL())
      .addFields(
        { name: 'Level', value: trainer?.level ? String(trainer.level) : 'Not set', inline: true },
        { name: 'Catches', value: String(counts.total), inline: true },
        { name: 'Shinies', value: String(counts.shinies), inline: true },
        { name: 'Unique species', value: String(counts.unique_species), inline: true },
      );
    let files;
    if (trainer?.profile_color) {
      embed.setColor(typeColorInt([trainer.profile_color]));
      const banner = typeBannerAttachment(trainer.profile_color);
      embed.setImage(banner.imageUrl);
      files = banner.files;
    }

    if (trainer?.bio) embed.addFields({ name: 'Bio', value: trainer.bio });
    if (trainer?.buddy_pokemon_id && POKEMON[trainer.buddy_pokemon_id]) {
      embed.addFields({ name: 'Buddy', value: POKEMON[trainer.buddy_pokemon_id].name });
    }

    if (recent.length) {
      embed.addFields({
        name: 'Recent catches',
        value: recent.map(c => {
          const p = POKEMON[c.pokemon_id];
          const name = p ? p.name : c.pokemon_id;
          return `${c.shiny ? '✨ ' : ''}${name}${c.cp ? ` · CP ${c.cp}` : ''}`;
        }).join('\n'),
      });
    } else {
      embed.addFields({ name: 'Recent catches', value: 'Nothing logged yet — try `/catch`!' });
    }

    await interaction.reply(files ? { embeds: [embed], files } : { embeds: [embed] });
  },
};
