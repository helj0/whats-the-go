// Renders a trainer's profile as a single PNG "card" (server-side, via
// @napi-rs/canvas — chosen over node-canvas because it ships prebuilt
// binaries, so it doesn't risk breaking the Railway build the way
// node-canvas's native Cairo/Pango compile step sometimes does on Docker
// hosts). Background is a gradient built from the trainer's chosen type
// colour; ink (text/panel) colour is picked per-type for contrast rather
// than hardcoded, since some types (Electric, Ice, Fairy) are light and
// some (Dark, Ghost, Poison) are dark.
//
// Deliberately no emoji glyphs are drawn on the canvas — Railway's container
// has no colour-emoji font installed, so ctx.fillText('✨') would silently
// render as a blank box. Everything visual here is either plain text/symbols
// (which any bundled font can render) or the bot's own bundled type icon
// PNGs, loaded and drawn directly.

const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');
const https = require('https');
const { TYPE_COLORS } = require('../data/types');

const FONT_DIR = path.join(__dirname, '..', '..', 'assets', 'fonts');
const ICON_DIR = path.join(__dirname, '..', '..', 'assets', 'icons');

let fontsRegistered = false;
function ensureFonts() {
  if (fontsRegistered) return;
  GlobalFonts.registerFromPath(path.join(FONT_DIR, 'Unbounded-Variable.ttf'), 'Unbounded');
  GlobalFonts.registerFromPath(path.join(FONT_DIR, 'Manrope-Variable.ttf'), 'Manrope');
  GlobalFonts.registerFromPath(path.join(FONT_DIR, 'SpaceMono-Regular.ttf'), 'Space Mono');
  GlobalFonts.registerFromPath(path.join(FONT_DIR, 'SpaceMono-Bold.ttf'), 'Space Mono');
  fontsRegistered = true;
}

function hexToRgb(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}
function mix(hex, target, amount) {
  const [r, g, b] = hexToRgb(hex);
  const nr = Math.round(r + (target[0] - r) * amount);
  const ng = Math.round(g + (target[1] - g) * amount);
  const nb = Math.round(b + (target[2] - b) * amount);
  return `rgb(${nr},${ng},${nb})`;
}

// Simple perceptual brightness (ITU-R BT.601 luma) — the same rough formula
// commonly used to decide "does this background need light or dark text".
// Not full WCAG contrast math, but more than good enough for a two-way pick.
function paletteFor(hex) {
  const [r, g, b] = hexToRgb(hex);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const light = brightness > 150;
  return light
    ? { ink: '#17181A', muted: 'rgba(23,24,26,0.62)', panel: 'rgba(0,0,0,0.08)', panelLine: 'rgba(0,0,0,0.14)', rowLine: 'rgba(0,0,0,0.10)', chip: 'rgba(0,0,0,0.09)' }
    : { ink: '#F7F5F0', muted: 'rgba(247,245,240,0.68)', panel: 'rgba(255,255,255,0.07)', panelLine: 'rgba(255,255,255,0.10)', rowLine: 'rgba(255,255,255,0.08)', chip: 'rgba(255,255,255,0.09)' };
}

// Drawn as a real path rather than a ★ text glyph — the bundled fonts don't
// cover that codepoint, which renders as a blank tofu box otherwise.
function drawStar(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const outerAngle = -Math.PI / 2 + i * (Math.PI * 2 / 5);
    const innerAngle = outerAngle + Math.PI / 5;
    const ox = cx + Math.cos(outerAngle) * r, oy = cy + Math.sin(outerAngle) * r;
    const ix = cx + Math.cos(innerAngle) * r * 0.42, iy = cy + Math.sin(innerAngle) * r * 0.42;
    if (i === 0) ctx.moveTo(ox, oy); else ctx.lineTo(ox, oy);
    ctx.lineTo(ix, iy);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) { res.resume(); reject(new Error(`HTTP ${res.statusCode} fetching ${url}`)); return; }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function loadTypeIcon(type) {
  try { return await loadImage(path.join(ICON_DIR, `${type}.png`)); } catch { return null; }
}

const W = 920, H = 500, PAD = 40, RADIUS = 28;

async function renderTrainerCard({ trainerName, level, avatarUrl, buddy, stats, recentCatches, type }) {
  ensureFonts();
  const baseHex = TYPE_COLORS[type] || TYPE_COLORS.normal;
  const pal = paletteFor(baseHex);

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Background: diagonal gradient, deep shade of the type colour -> a brighter
  // version of the same hue, so it reads as "this type" without being a flat poster fill.
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, mix(baseHex, [0, 0, 0], 0.60));
  grad.addColorStop(1, mix(baseHex, [255, 255, 255], 0.14));
  ctx.fillStyle = grad;
  roundRectPath(ctx, 0, 0, W, H, RADIUS);
  ctx.fill();

  // ---- Header: avatar + name/level/stats ----
  const avatarSize = 108;
  const avatarX = PAD, avatarY = PAD;
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  if (avatarUrl) {
    try {
      const buf = await fetchBuffer(avatarUrl);
      const img = await loadImage(buf);
      ctx.drawImage(img, avatarX, avatarY, avatarSize, avatarSize);
    } catch {
      ctx.fillStyle = pal.panel;
      ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
    }
  } else {
    ctx.fillStyle = pal.panel;
    ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
  }
  ctx.restore();
  ctx.lineWidth = 3;
  ctx.strokeStyle = pal.ink;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 - 1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  const textX = avatarX + avatarSize + 26;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = pal.muted;
  ctx.font = '700 12px "Space Mono"';
  ctx.fillText(`TRAINER CARD · LV. ${level ?? '—'}`, textX, avatarY + 22);

  ctx.fillStyle = pal.ink;
  ctx.font = '800 42px Unbounded';
  ctx.fillText(trainerName, textX, avatarY + 68);

  ctx.font = '700 17px Manrope';
  ctx.fillStyle = pal.ink;
  const statParts = [`${stats.total} catches`, `${stats.shinies} shiny`, `${stats.unique_species} species`];
  let sx = textX;
  const sy = avatarY + 98;
  for (let i = 0; i < statParts.length; i++) {
    ctx.font = '700 15px "Space Mono"';
    const numText = String(statParts[i].split(' ')[0]);
    ctx.fillText(numText, sx, sy);
    const numW = ctx.measureText(numText).width;
    sx += numW + 6;
    ctx.font = '600 15px Manrope';
    ctx.fillStyle = pal.muted;
    const rest = ' ' + statParts[i].split(' ').slice(1).join(' ');
    ctx.fillText(rest, sx, sy);
    sx += ctx.measureText(rest).width + 16;
    ctx.fillStyle = pal.ink;
  }

  // ---- Buddy chip, top-right ----
  if (buddy) {
    ctx.font = '600 13px Manrope';
    const label = `Buddy: ${buddy.name}`;
    const labelW = ctx.measureText(label).width;
    const dotsW = buddy.types.length * 12;
    const chipPadX = 16, chipH = 34;
    const chipW = dotsW + 8 + labelW + chipPadX * 2;
    const chipX = W - PAD - chipW, chipY = PAD;
    ctx.fillStyle = pal.chip;
    roundRectPath(ctx, chipX, chipY, chipW, chipH, chipH / 2);
    ctx.fill();
    ctx.strokeStyle = pal.panelLine;
    ctx.lineWidth = 1;
    roundRectPath(ctx, chipX, chipY, chipW, chipH, chipH / 2);
    ctx.stroke();

    let dotX = chipX + chipPadX;
    const dotY = chipY + chipH / 2;
    for (const t of buddy.types) {
      ctx.fillStyle = TYPE_COLORS[t] || TYPE_COLORS.normal;
      ctx.beginPath();
      ctx.arc(dotX + 5, dotY, 5, 0, Math.PI * 2);
      ctx.fill();
      dotX += 12;
    }
    ctx.fillStyle = pal.ink;
    ctx.font = '600 13px Manrope';
    ctx.fillText(label, dotX + 4, dotY + 4);
  }

  // ---- Recent catches panel ----
  const panelY = avatarY + avatarSize + 22;
  const panelH = H - panelY - 58;
  roundRectPath(ctx, PAD, panelY, W - PAD * 2, panelH, 18);
  ctx.fillStyle = pal.panel;
  ctx.fill();
  ctx.strokeStyle = pal.panelLine;
  ctx.lineWidth = 1;
  roundRectPath(ctx, PAD, panelY, W - PAD * 2, panelH, 18);
  ctx.stroke();

  ctx.fillStyle = pal.muted;
  ctx.font = '700 11px "Space Mono"';
  ctx.fillText('RECENT CATCHES', PAD + 16, panelY + 24);

  const rows = recentCatches.slice(0, 4);
  const rowsTop = panelY + 36;
  const rowH = rows.length ? (panelH - 36) / rows.length : 0;

  for (let i = 0; i < rows.length; i++) {
    const c = rows[i];
    const rowY = rowsTop + i * rowH;
    if (i > 0) {
      ctx.strokeStyle = pal.rowLine;
      ctx.beginPath();
      ctx.moveTo(PAD + 16, rowY);
      ctx.lineTo(W - PAD - 16, rowY);
      ctx.stroke();
    }
    const cy = rowY + rowH / 2;

    const iconR = 15;
    const iconCx = PAD + 32, iconCy = cy;
    ctx.save();
    ctx.beginPath();
    ctx.arc(iconCx, iconCy, iconR, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = TYPE_COLORS[c.types[0]] || TYPE_COLORS.normal;
    ctx.fillRect(iconCx - iconR, iconCy - iconR, iconR * 2, iconR * 2);
    const icon = await loadTypeIcon(c.types[0]);
    if (icon) ctx.drawImage(icon, iconCx - iconR, iconCy - iconR, iconR * 2, iconR * 2);
    ctx.restore();

    ctx.fillStyle = pal.ink;
    ctx.font = '600 15px Manrope';
    ctx.fillText(c.name, PAD + 58, cy + 5);

    ctx.font = '600 12px "Space Mono"';
    const rightEdge = W - PAD - 16;
    if (c.shiny) {
      const label = 'SHINY';
      const labelW = ctx.measureText(label).width;
      ctx.fillStyle = pal.ink;
      ctx.fillText(label, rightEdge - labelW, cy + 4);
      drawStar(ctx, rightEdge - labelW - 12, cy, 7, pal.ink);
    } else {
      const rightText = c.cp ? `CP ${c.cp}` : c.types.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' / ');
      const rw = ctx.measureText(rightText).width;
      ctx.fillStyle = pal.muted;
      ctx.fillText(rightText, rightEdge - rw, cy + 4);
    }
  }

  // ---- Footer ----
  ctx.fillStyle = pal.muted;
  ctx.font = '500 12px Manrope';
  ctx.fillText("What's the GO? · unofficial fan project", PAD, H - 22);

  return canvas.toBuffer('image/png');
}

module.exports = { renderTrainerCard };
