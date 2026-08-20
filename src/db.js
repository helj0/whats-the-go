// Thin Postgres layer — plain SQL via `pg`, no ORM. Call `initDb()` once at
// startup; it creates tables if they don't exist yet (safe to run every boot).
//
// Requires a DATABASE_URL env var. On Railway: add the Postgres plugin to
// this project and it sets DATABASE_URL automatically.

const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.warn('[db] DATABASE_URL is not set — the bot will crash on first DB call. ' +
    'On Railway, add a Postgres plugin to this project; it sets this automatically.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('railway') ? { rejectUnauthorized: false } : undefined,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS guild_settings (
      guild_id TEXT PRIMARY KEY,
      event_channel_id TEXT,
      announced_event_ids TEXT[] NOT NULL DEFAULT '{}'
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS trainers (
      user_id TEXT PRIMARY KEY,
      trainer_name TEXT,
      level INTEGER,
      bio TEXT,
      buddy_pokemon_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS catches (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      pokemon_id TEXT NOT NULL,
      shiny BOOLEAN NOT NULL DEFAULT FALSE,
      cp INTEGER,
      event_id TEXT,
      caught_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS catches_user_idx ON catches(user_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS catches_event_idx ON catches(event_id);`);
  console.log('[db] schema ready');
}

// ---- guild settings ----
async function setGuildEventChannel(guildId, channelId) {
  await pool.query(
    `INSERT INTO guild_settings (guild_id, event_channel_id) VALUES ($1, $2)
     ON CONFLICT (guild_id) DO UPDATE SET event_channel_id = $2`,
    [guildId, channelId]
  );
}
async function getGuildSettings(guildId) {
  const { rows } = await pool.query(`SELECT * FROM guild_settings WHERE guild_id = $1`, [guildId]);
  return rows[0] || null;
}
async function getAllGuildSettingsWithChannel() {
  const { rows } = await pool.query(`SELECT * FROM guild_settings WHERE event_channel_id IS NOT NULL`);
  return rows;
}
async function markEventAnnounced(guildId, eventId) {
  await pool.query(
    `UPDATE guild_settings SET announced_event_ids = array_append(announced_event_ids, $2)
     WHERE guild_id = $1 AND NOT ($2 = ANY(announced_event_ids))`,
    [guildId, eventId]
  );
}

// ---- trainers / profile ----
async function upsertTrainer(userId, fields) {
  const existing = await getTrainer(userId);
  if (existing) {
    const merged = { ...existing, ...fields };
    await pool.query(
      `UPDATE trainers SET trainer_name=$2, level=$3, bio=$4, buddy_pokemon_id=$5 WHERE user_id=$1`,
      [userId, merged.trainer_name, merged.level, merged.bio, merged.buddy_pokemon_id]
    );
  } else {
    await pool.query(
      `INSERT INTO trainers (user_id, trainer_name, level, bio, buddy_pokemon_id) VALUES ($1,$2,$3,$4,$5)`,
      [userId, fields.trainer_name || null, fields.level || null, fields.bio || null, fields.buddy_pokemon_id || null]
    );
  }
}
async function getTrainer(userId) {
  const { rows } = await pool.query(`SELECT * FROM trainers WHERE user_id = $1`, [userId]);
  return rows[0] || null;
}

// ---- catches ----
async function addCatch(userId, pokemonId, { shiny = false, cp = null, eventId = null } = {}) {
  const { rows } = await pool.query(
    `INSERT INTO catches (user_id, pokemon_id, shiny, cp, event_id) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [userId, pokemonId, shiny, cp, eventId]
  );
  return rows[0];
}
async function removeMostRecentCatch(userId, pokemonId, shiny) {
  const { rows } = await pool.query(
    `DELETE FROM catches WHERE id = (
       SELECT id FROM catches WHERE user_id=$1 AND pokemon_id=$2 AND shiny=$3
       ORDER BY caught_at DESC LIMIT 1
     ) RETURNING *`,
    [userId, pokemonId, shiny]
  );
  return rows[0] || null;
}
async function hasCatch(userId, pokemonId, shiny, eventId) {
  const { rows } = await pool.query(
    `SELECT 1 FROM catches WHERE user_id=$1 AND pokemon_id=$2 AND shiny=$3 AND event_id=$4 LIMIT 1`,
    [userId, pokemonId, shiny, eventId]
  );
  return rows.length > 0;
}
async function getRecentCatches(userId, limit = 10) {
  const { rows } = await pool.query(
    `SELECT * FROM catches WHERE user_id=$1 ORDER BY caught_at DESC LIMIT $2`,
    [userId, limit]
  );
  return rows;
}
async function getCatchCounts(userId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE shiny)::int AS shinies,
            COUNT(DISTINCT pokemon_id)::int AS unique_species
     FROM catches WHERE user_id=$1`,
    [userId]
  );
  return rows[0];
}
async function getEventCatches(userId, eventId) {
  const { rows } = await pool.query(
    `SELECT * FROM catches WHERE user_id=$1 AND event_id=$2`,
    [userId, eventId]
  );
  return rows;
}
async function getTopCollectors(limit = 50) {
  const { rows } = await pool.query(
    `SELECT user_id, COUNT(*)::int AS total, COUNT(*) FILTER (WHERE shiny)::int AS shinies,
            COUNT(DISTINCT pokemon_id)::int AS unique_species
     FROM catches GROUP BY user_id ORDER BY total DESC LIMIT $1`,
    [limit]
  );
  return rows;
}

module.exports = {
  pool, initDb,
  setGuildEventChannel, getGuildSettings, getAllGuildSettingsWithChannel, markEventAnnounced,
  upsertTrainer, getTrainer,
  addCatch, removeMostRecentCatch, hasCatch, getRecentCatches, getCatchCounts, getEventCatches, getTopCollectors,
};
