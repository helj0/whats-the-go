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

const FIELD_LIMIT = 1024; // Discord's hard cap on a single embed field's value

// Joins entry strings into one field value, stopping short of Discord's 1024-char
// field limit and noting how many got left off rather than overflowing/crashing.
function capField(entries, limit = FIELD_LIMIT) {
  const lines = [];
  let used = 0;
  for (const line of entries) {
    const addLen = line.length + (lines.length ? 2 : 0); // account for the '\n\n' join
    if (used + addLen > limit - 40) break; // leave headroom for the "+N more" note
    lines.push(line);
    used += addLen;
  }
  let value = lines.join('\n\n');
  const remaining = entries.length - lines.length;
  if (remaining > 0) value += `\n\n*+${remaining} more*`;
  return value;
}

// Adds a list of formatted entry strings as a single field, or — once there
// are more than `threshold` entries on one side — as two side-by-side inline
// fields instead. Discord embeds have no native multi-column text; two
// adjacent `inline: true` fields is the standard way to fake one.
//
// Discord lays inline fields out three to a row, not two, so calling this
// more than once on the same embed (e.g. /events' Live + On deck lists) would
// otherwise let one group's second column bleed into the next group's row.
// The trailing zero-width, non-inline spacer field forces a row break after
// every 2-column group so each call's pair always lands on its own row.
function addListField(embed, name, entries, threshold = 6) {
  if (!entries.length) return;
  if (entries.length <= threshold) {
    embed.addFields({ name, value: capField(entries) });
    return;
  }
  const mid = Math.ceil(entries.length / 2);
  embed.addFields(
    { name, value: capField(entries.slice(0, mid)), inline: true },
    { name: '​', value: capField(entries.slice(mid)), inline: true },
    { name: '​', value: '​', inline: false },
  );
}

function baseEmbed(title) {
  return new EmbedBuilder()
    .setColor(BRAND_COLOR)
    .setTitle(title)
    .setFooter({ text: "What's the GO? 🐾 · unofficial fan project, not affiliated with Niantic/Nintendo/Game Freak/The Pokémon Company · Event data via LeekDuck.com, sourced through ScrapedDuck" });
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

function typeBannerAttachment(type) {
  // Returns { files, imageUrl } — same attachment:// trick as the type icons,
  // for the wide gradient banner PNGs bundled in assets/banners (filenames are
  // UPPERCASE, e.g. FIRE.png — matches how they were provided).
  const { AttachmentBuilder } = require('discord.js');
  const path = require('path');
  const filePath = path.join(__dirname, '..', '..', 'assets', 'banners', `${type.toUpperCase()}.png`);
  const file = new AttachmentBuilder(filePath, { name: `${type}-banner.png` });
  return { files: [file], imageUrl: `attachment://${type}-banner.png` };
}

module.exports = { BRAND_COLOR, SUCCESS_COLOR, INFO_COLOR, typeColorInt, typeLine, baseEmbed, speciesThumbnailAttachment, typeBannerAttachment, addListField, capField };
