const { EmbedBuilder } = require('discord.js');
const { TYPE_COLORS, TYPE_EMOJI } = require('../data/types');

// A lighter, brighter palette than the raw type colors for embed accents —
// keeps things feeling bubbly rather than using the darker/muddier raw
// type hex values everywhere.
const BRAND_COLOR = 0xFFC93C; // warm gold, used for neutral/brand embeds
const SUCCESS_COLOR = 0x5CEBA8;
const INFO_COLOR = 0x8FC0FF;

function typeColorInt(types) {
  const hex = TYPE_COLORS[types[0]] || '#FFC93C';
  return parseInt(hex.replace('#', ''), 16);
}

function typeLine(types) {
  return types.map(t => `${TYPE_EMOJI[t] || ''} ${t.charAt(0).toUpperCase() + t.slice(1)}`).join('  /  ');
}

function baseEmbed(title) {
  return new EmbedBuilder()
    .setColor(BRAND_COLOR)
    .setTitle(title)
    .setFooter({ text: "What's the GO? Buddy 🐾 · unofficial fan project, not affiliated with Niantic/Nintendo/Game Freak/The Pokémon Company" });
}

function speciesThumbnailAttachment(primaryType) {
  // Returns { files, thumbnailUrl } — attach the type icon PNG bundled in
  // assets/icons and reference it via the attachment:// URI, so embeds get
  // a real image without needing any external image hosting.
  const { AttachmentBuilder } = require('discord.js');
  const path = require('path');
  const filePath = path.join(__dirname, '..', '..', 'assets', 'icons', `${primaryType}.png`);
  const file = new AttachmentBuilder(filePath, { name: `${primaryType}.png` });
  return { files: [file], thumbnailUrl: `attachment://${primaryType}.png` };
}

module.exports = { BRAND_COLOR, SUCCESS_COLOR, INFO_COLOR, typeColorInt, typeLine, baseEmbed, speciesThumbnailAttachment };
