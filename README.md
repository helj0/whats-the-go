# What's the GO? Buddy — Discord Bot

A Pokémon GO event/raid/collection companion bot. Unofficial fan project,
not affiliated with Niantic, Nintendo, Game Freak, or The Pokémon Company.

Reuses the species roster, PvPoke-sourced PVP data, and eDPS calculations
from the companion web app this project started as — see the data-honesty
notes below before extending it.

## Commands

| Command | What it does |
|---|---|
| `/events` | Live and upcoming events |
| `/raids` | Current raid bosses across all live events, with quick-jump buttons to counters |
| `/counters <pokemon>` | Best PVE counters for a species (type effectiveness × power level) |
| `/catch <pokemon> [shiny] [cp]` | Log a catch to your profile; auto-tags it to a live event if that species is currently featured |
| `/profile view [trainer]` | Your profile (or someone else's) — level, bio, buddy, catch stats, recent catches |
| `/profile edit` | Set your trainer name, level, bio, buddy |
| `/spawns` | Current event wild spawns |
| `/bonuses` | Current event bonuses + Star Piece / Lucky Egg / Incense recommendations |
| `/setup channel` | (Admin) Set which channel gets event push announcements |
| `/setup status` | (Admin) Check current settings |

A background scheduler checks every 5 minutes for events that just went
live and pushes an announcement to every server that's run `/setup channel`
— each server only gets a given event announced once.

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

## Known limitations (be upfront about these)

1. **Event data is hardcoded and will go stale.** `src/data/events.js` has
   12 real Aug–Sep 2026 events with fixed dates. Once those pass, `/events`,
   `/raids`, `/spawns`, `/bonuses`, and the push scheduler will have nothing
   live to show. There's no live data source wired up — someone needs to
   either hand-update `events.js` periodically or build a scraper against a
   real source (ScrapedDuck/LeekDuck's public event feed is the same kind
   of source the original web app was built to reference).
2. **eDPS coverage is 53 species**, not the full 986-species roster. See
   the web app's `HANDOFF.md` (if you still have that package) for exactly
   how those were computed and why it's capped there.
3. **PVP data (Great/Ultra League) covers 51 species**; Master League was
   never fetched at all in this project's history.
4. **No moderation/rate-limiting** on `/catch` — someone could spam-log
   fake catches. Fine for a small trusted server, worth adding guardrails
   before opening this to the public.
5. **Single-instance scheduler** — if you ever run more than one bot
   instance (e.g. horizontal scaling), the 5-minute poll loop will run in
   every instance and could double-announce. Not a concern at your current
   scale, but don't spin up a second Railway instance of this without
   addressing it first.
