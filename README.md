# What's the GO? Buddy — Discord Bot

A **PVE-focused** Pokémon GO event, raid-counter, and friendly-collecting
companion bot. Unofficial fan project, not affiliated with Niantic,
Nintendo, Game Freak, or The Pokémon Company.

This bot does not track, compute, or display any PVP data — that's a
deliberate scope decision, not an oversight. It's built around three
things: automated event news, PVE raid counters based on real type
matchups and general Pokémon GO raid knowledge, and light social features
(medals, a leaderboard) to encourage friendly collecting between friends
in a server.

Reuses the species roster and eDPS raid-power calculations from the
companion web app this project started as — see the data-honesty notes
below before extending it.

## Commands

| Command | What it does |
|---|---|
| `/events` | Live and upcoming events |
| `/raids` | Current raid bosses across all live events, with quick-jump buttons to counters |
| `/counters <pokemon>` | Best PVE counters for a raid boss (type effectiveness × raid power level) |
| `/catch <pokemon> [shiny] [cp]` | Log a catch to your profile; auto-tags it to a live event if that species is currently featured |
| `/release <pokemon> [shiny]` | Remove a catch you logged by mistake — undoes the most recent matching `/catch` |
| `/profile view [trainer]` | Your profile (or a friend's) — level, bio, buddy, catch stats, recent catches |
| `/profile edit` | Set your trainer name, level, bio, buddy |
| `/medals [trainer]` | Event completion medals — locked / Gold / Platinum, yours or a friend's |
| `/leaderboard` | Top collectors in this server — friendly competition |
| `/spawns` | Current event wild spawns |
| `/bonuses` | Current event bonuses + Star Piece / Lucky Egg / Incense recommendations |
| `/setup channel` | (Admin) Set which channel gets event push announcements |
| `/setup status` | (Admin) Check current settings, including live event-data health |
| `/help` | List all commands, in-Discord |

A background scheduler checks every 5 minutes for events that just went
live and automatically pushes a "now live" announcement (bonuses included)
to every server that's run `/setup channel` — each server only gets a
given event announced once. This is the automated news piece: no one has
to remember to check for events, the bot tells the server when something
starts.

## Medals — how they work

Ported from the companion web app's Medals tab:

- **Gold** — every featured species from an event (wild spawns + raid
  bosses) has been caught at least once (`/catch` auto-tags it if the
  event is live when you log it)
- **Platinum** — Gold, plus every shiny-eligible featured species has been
  caught in its shiny form too
- Events with no catchable species (league-only events, etc.) don't get a
  medal at all — nothing to complete

`/medals` shows every event's status for you or a friend. `/leaderboard`
ranks the server by total catches logged, to nudge friendly competition
without needing medals to be the only way to compare notes.

## Setup

### 1. Create a Discord Application for this bot

You mentioned you already have a bot token, but that's tied to a different
application — bot tokens aren't reusable across apps, so you'll need a new one:

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) → **New Application**.
2. Name it (e.g. "What's the GO? Buddy").
3. Go to **Bot** in the sidebar → **Reset Token** → copy it. This is your `DISCORD_TOKEN`. Keep it secret — anyone with it can control the bot.
4. Go to **General Information** → copy the **Application ID**. This is your `DISCORD_CLIENT_ID`.
5. Still on the **Bot** page, make sure **Public Bot** is on if you want others to be able to invite it later (fine to leave on even for personal use).
6. Go to **OAuth2 → URL Generator**:
   - Scopes: check `bot` and `applications.commands`.
   - Bot Permissions: check `Send Messages`, `Embed Links`, `Attach Files`, `Use Slash Commands`.
   - Copy the generated URL, open it, and invite the bot to your server.

### 2. Local dependencies

```bash
npm install
cp .env.example .env
# fill in DISCORD_TOKEN, DISCORD_CLIENT_ID, DATABASE_URL in .env
```

### 3. Database

The bot needs Postgres (guild settings, trainer profiles, catch logs — this
replaces the browser-only storage the original web app used, which doesn't
exist outside Claude.ai). On Railway: add the **Postgres** plugin to this
project and it sets `DATABASE_URL` automatically. Locally, point it at any
Postgres instance.

The schema is created automatically on first boot (`initDb()` runs in
`index.js`) — no separate migration step needed.

### 4. Register slash commands

Slash commands have to be explicitly registered with Discord before they
show up. Run this once, and again any time you add/change a command:

```bash
npm run deploy-commands
```

Global commands can take up to ~1 hour to appear everywhere the first time
(subsequent updates are usually much faster).

### 5. Deploy to Railway

Since you've already got a bot running there:

1. New Railway project → deploy from this repo (or `railway up` from this folder).
2. Add the **Postgres** plugin to the project.
3. In the service's Variables tab, set `DISCORD_TOKEN` and `DISCORD_CLIENT_ID` (leave `DATABASE_URL` — Railway's Postgres plugin sets it for you automatically once attached).
4. Set the start command to `npm start` (should be auto-detected from `package.json`).
5. Once it's running, run `npm run deploy-commands` **once** (either locally with the same `.env` values, or as a one-off Railway run) to register the slash commands.
6. In each Discord server, an admin runs `/setup channel #your-events-channel` to turn on push announcements.

## Sprites / images — what this does and doesn't do

Per the reasoning already worked through for this project: no Pokémon
character art or sprites are used anywhere, including here. `/assets/icons/`
contains the 19 type-icon PNGs from the web app (18 types + shiny), used as
embed thumbnails via Discord's `attachment://` mechanism — no external image
hosting needed, and no copyrighted character artwork. If you want real
sprite-style art later, that needs a rights-cleared source; datamined
assets (Pokéminers or similar) carry real infringement risk regardless of
whether other bots have gotten away with it so far.

## Data honesty — read before extending

Same rule this whole project has followed: **never present a fabricated
number as if it were verified.** Every counters/eDPS result is tagged with
its actual source:

- ✅ `verified` — real base stats fetched from PvPoke's public data (35 species, dex 1–75 only — that fetch source truncates and can't be paginated further)
- 🔷 `estimated` — real movesets, base stats from general knowledge not a fresh fetch (the 30 curated species, plus a slightly broader set for eDPS)
- 🔹 `tier-estimate` — no real numbers at all, just a coarse Legendary/Strong/Regular tier band

The `/counters` command's footer always explains this. Don't quietly merge
these tiers into one undifferentiated "power" number if you extend this —
keep the tagging.

## Event data: live from ScrapedDuck (with a safety net)

`/events`, `/raids`, `/spawns`, `/bonuses`, and the push scheduler now pull
from **ScrapedDuck** (bigfoott/ScrapedDuck on GitHub), which scrapes
LeekDuck.com on its own schedule and republishes it as JSON — refreshed
here every hour. The static 12-event Aug–Sep 2026 dataset from before is
kept as a **fallback only**: if the live fetch fails or its response
doesn't look like valid event data, the bot logs a warning and keeps
serving the last known-good data (starting with that static set) rather
than showing nothing or crashing.

**Important — this integration needs to be verified once you have real
network access (which Railway will, but the sandbox this was built in did
not):**

The endpoint URL and field-name mapping in `src/data/live-events.js` are
based on cross-referenced documentation of *other* tools that consume this
feed (PoGOEvents, go-calendar, MMM-PokemonGOEvents all describe using it),
not a fetch-and-verify pass against the real JSON — I could not reach
`raw.githubusercontent.com` from the sandbox (confirmed: the request came
back with an explicit HTTP 403 from the network proxy, not a timeout, so
this is a real access restriction, not a fluke). Before trusting this in
production:

```bash
node -e "require('./src/data/live-events').refreshEvents().then(() => console.log(require('./src/data/live-events').getStatus()))"
```

Check `lastFetchOk`. Run `/setup status` in Discord for the same info
(shows a ⚠️/✅ indicator either way). If it's failing, or events come back
with suspiciously empty `bonuses`/`raidBosses`/`wildSpawns`, temporarily
add a `console.log(JSON.stringify(raw[0], null, 2))` right after the fetch
in `refreshEvents()` to see the real shape, and adjust the field paths in
`transformEvent()` in the same file to match. That whole function is
written defensively (returns `null` and skips a malformed event rather
than throwing) specifically so a wrong guess there degrades gracefully.

**Also worth knowing:** the hand-written "Trainer tip" that appeared on
each of the 12 seed events doesn't have an equivalent in ScrapedDuck's
feed — live-fetched events won't have one (the field is just omitted from
the embed rather than shown empty).

Per ScrapedDuck's usage terms (this bot is free and ad-free, so it's
covered): always keep the "Event data via LeekDuck.com, sourced through
ScrapedDuck" credit in the embed footer if you touch `utils/embeds.js`.



1. **The ScrapedDuck integration is unverified against the live feed** —
   see the section above. Real-world testing on Railway (or any host with
   actual internet access) is a required step before you trust it, not an
   optional nice-to-have. The static `events.js` fallback data will itself
   go stale after Aug-Sep 2026, but only matters if the live fetch is also
   broken at that point.
2. **eDPS coverage is 53 species**, not the full 986-species roster. See
   the web app's `HANDOFF.md` (if you still have that package) for exactly
   how those were computed and why it's capped there. (This is base-stat
   / raid-power data, not PVP — the bot doesn't have or want PVP data.)
3. **Basic anti-spam only.** `/catch` is rate-limited to 10 calls/minute
   per user (in-memory, resets on restart) and rejects CP values outside
   10–6000. That stops accidental spam and typos, not a determined bad
   actor — there's still no server-side validation that a catch is
   "real," so a motivated user could still log fake catches within the
   rate limit. Fine for a small trusted server; worth hardening further
   before opening this to the public.
4. **Single-instance scheduler** — if you ever run more than one bot
   instance (e.g. horizontal scaling), the 5-minute poll loop will run in
   every instance and could double-announce. Not a concern at your current
   scale, but don't spin up a second Railway instance of this without
   addressing it first.
