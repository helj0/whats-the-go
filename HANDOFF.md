# What's the GO? — Discord Bot Handoff

A PVE-focused Pokémon GO companion Discord bot: automated event news,
raid counters, catch/collection tracking, and light social features
(medals, a leaderboard) to encourage friendly collecting in a server.
Unofficial fan project, not affiliated with Niantic, Nintendo, Game Freak,
or The Pokémon Company.

This document is for whoever (human or Claude Code) picks this project up
next. It covers what actually exists right now, what's real data vs.
estimated, what's been tested vs. assumed, and concrete next steps. A
`README.md` sits alongside this with setup/deployment instructions — this
document is about context and history, not "how to run it."

## 0. Where this came from

This bot is the second half of a two-part project. It started as a
single-file web app prototype (built in a separate Claude.ai conversation
sandbox), which has its own `HANDOFF.md` if that package still exists
somewhere — that document explains the original data-honesty rules this
whole project follows and where the species roster / eDPS calculations
originally came from. **The web app itself no longer matters** — this bot
reuses its data files but the two aren't connected at runtime, and the web
app had a browsable "Tier List" feature that was deliberately removed from
this bot's design. Don't reintroduce it here without being asked.

## 1. What's actually implemented (12 commands)

| Command | Real, tested behavior |
|---|---|
| `/events` | Lists live events, with a button per one (up to 4) — **this is interactive**, not just a static reply (see §3). Upcoming events live behind a separate "See upcoming events" button rather than in the same view. |
| `/raids` | Current raid bosses across live events, with quick-jump buttons to `/counters` for the top 3. |
| `/counters <pokemon>` | Best PVE counters by type effectiveness × raid power (eDPS where available, tier-band fallback otherwise; Mega/Shadow/Legendary forms considered too). Autocomplete on species name. |
| `/catch <pokemon> [shiny] [cp]` | Logs a catch. Auto-tags to a live event if that species is currently featured. Rate-limited (10/min/user) and CP-validated (10–6000). |
| `/release <pokemon> [shiny]` | Undoes a `/catch` — removes the most recent matching catch via `db.removeMostRecentCatch()`, regardless of which event (or none) it was tagged to. Rate-limited the same as `/catch`. |
| `/profile view/edit` | Trainer profile: level, bio, buddy, catch stats, recent catches. Subcommands, not options — don't flatten these back into one command, Discord doesn't allow mixing top-level options with subcommands (see §6, bug #1). |
| `/medals [trainer]` | Per-event completion: Locked → Gold (every featured species caught) → Platinum (+ their shinies). Ported from the web app's Medals tab, which never actually made it into the bot until this was built. |
| `/leaderboard` | Top collectors *in the current server*, ranked by total catches. Catches aren't stored per-guild in the DB — this resolves global top collectors down to actual guild members via individual `members.fetch()` calls, which works without the privileged GuildMembers intent. |
| `/spawns` | Current event wild spawns. |
| `/bonuses` | Current event bonuses + Star Piece / Lucky Egg / Incense recommendations (keyword-matched against bonus text, plus a hardcoded rule that Community Day almost always recommends Lucky Egg + Incense even if the bonus text doesn't say so explicitly). |
| `/setup channel/status` | Admin-only (`ManageGuild` permission). Sets the per-guild announcement channel; status also reports live-event-data fetch health. |
| `/help` | Lists everything, grouped. |

Plus a background scheduler (`src/scheduler.js`) that polls every 5 minutes
and pushes a "now live" announcement — bonuses, item recommendation, trainer
tip — to every server that's configured a channel, once per event per
server.

## 2. Data model — what's real vs. estimated (read before extending)

**PVP data does not exist anywhere in this codebase.** It was deliberately
and completely removed — not hidden, removed. `src/data/pvp-sourced.js` no
longer exists as a file. `roster.js` explicitly strips any legacy `pvp`
field via destructuring if the source data ever has one. The raw curated
data file (`pokemon-curated.js`) had 30 embedded `pvp:{...}` blocks
programmatically stripped out of the source itself. Verified via test:
zero of the 986 species in `ALL_POKEMON` carry a `pvp` key. **Do not
reintroduce PVP tracking or display without being explicitly asked** — this
was a deliberate scope decision (see conversation history: "focus this bot
being a PVE focused bot").

For PVE data, the same three-tier honesty system from the web app carries
over:

- **✅ verified** — real base stats fetched live from PvPoke's
  `gamemaster.json` (35 species, dex 1–75 only — that fetch source
  truncates at a fixed size and dex-ordering means only the low end of the
  dex range was ever reachable; this is *species base stats*, not PVP
  data, despite coming from a tool named after PVP rankings)
- **🔷 estimated** — real movesets from earlier research, base stats from
  general knowledge rather than a fresh fetch (the 30 curated species)
- **🔹 tier-band estimate** — no real numbers, just a coarse
  Legendary/Strong/Regular classification (the other ~900 species)

53 species total have a computed eDPS "power level." Everyone else's
`/counters` ranking falls back to the tier band. Never show a fabricated
precise number (a rank, an exact DPS value) for a species that doesn't
have one — "not tracked" or a coarse tier is the honest answer, and that
pattern is enforced by test (`/counters` output is checked for stray
`undefined` and for absence of invented precision).

## 3. Interactive events — the newest, most stateful piece

`/events` isn't just a static embed anymore. `src/utils/event-view.js` is
the shared module behind the whole click-through flow:

- `buildEventListView()` — the events list, with one button per live event
  (`customId: ev:v:<eventId>`)
- `buildEventDetailView(userId, eventId)` — a specific event's detail
  view: bonuses, trainer tip, item recs, and up to 4 species each getting
  a **Caught** button (`ev:c:<eventId>:<pokemonId>:b`) and, if the species
  has a shiny, a **Shiny caught** button (`...:s`). Button style reflects
  current catch state (grey/Secondary if not caught, green/Success with a
  checkmark if caught) — this requires a DB read on every render, it's not
  cached.
- `toggleEventCatch(userId, eventId, pokemonId, shiny)` — the actual
  toggle logic. Base and shiny catches are toggled fully independently —
  catching the shiny no longer implies the base is caught too. (This used
  to auto-log the base catch; that was removed at the user's request.)

`index.js`'s `interactionCreate` handler routes `isButton()` interactions
by splitting `customId` on `:` — `ev:back`, `ev:v:*`, `ev:c:*:*:b|s`, plus
the older `counters:*` scheme still used by `/raids`' quick-jump buttons.
All navigation uses `interaction.update()` (edits the message in place),
never a new `reply()` — that's what makes it feel like an app rather than
a stream of new messages.

**Constraint worth knowing:** Discord caps a message at 5 action rows.
Species buttons are capped at 4 rows (leaving 1 for Back), so an event
with more than 4 featured species will only show buttons for the first 4
— the rest fall back to text-only status in the embed with a note to use
`/catch` instead. None of the current 12 seed events hit this limit (most
have 1–2 featured species), so it's untested against a real high-count
event. If you add an event with 5+ featured species, verify this
degradation actually looks right rather than assuming.

## 4. Live event data — real integration, unverified schema

`src/data/live-events.js` fetches from ScrapedDuck
(`raw.githubusercontent.com/bigfoott/ScrapedDuck/data/events.json`) every
hour, with automatic fallback to the static 12-event seed data
(`src/data/events.js`) if the fetch fails or the response doesn't parse
into at least one usable event.

**This has never been tested against the real live feed.** The sandbox
this was built in returned an explicit HTTP 403 from its network proxy
when the code tried to reach `raw.githubusercontent.com` — confirmed via
direct test, not a guess — so the endpoint URL and especially the
field-name mapping in `transformEvent()` are based on cross-referenced
*documentation of other tools* that consume this feed (PoGOEvents,
go-calendar, MMM-PokemonGOEvents), not a verified fetch. The fallback
path itself is well-tested (confirmed it degrades cleanly rather than
crashing when the fetch fails). The live path's correctness is not.

**First thing to do with real internet access:**
```bash
node -e "require('./src/data/live-events').refreshEvents().then(() => console.log(require('./src/data/live-events').getStatus()))"
```
Check `lastFetchOk`. If false, or if it's true but events come back with
empty `bonuses`/`raidBosses`/`wildSpawns` where you'd expect data, add a
temporary `console.log(JSON.stringify(raw[0], null, 2))` right after the
fetch in `refreshEvents()` and fix the field paths in `transformEvent()`
to match. `/setup status` in Discord shows the same health info live.

One known gap either way: ScrapedDuck doesn't provide anything like the
hand-written "Trainer tip" the 12 seed events have — live-fetched events
just won't have one, the embed field is omitted rather than shown empty.

## 5. Banners / images

No Pokémon character art or official Niantic/Pokémon Company imagery is
used anywhere, including in announcement banners. This was checked, not
assumed: the official press site (`press.pokemon.com` /
`pokemon.gamespress.com`) is registration-gated for credentialed media —
confirmed via a direct 401 — so it isn't scrapable even before getting to
the licensing question. Type-icon PNGs bundled in `/assets/icons/` (18
types + shiny, from the web app, cropped + 85% opacity) are the only
visual assets, used via Discord's `attachment://` mechanism so no external
image hosting is needed. If event announcements want a banner image,
generate one programmatically from type colors + the bundled icons (see
the mockup-generation approach used for the reference JPEGs shared in
conversation — same principle, not yet built into the actual bot).

## 5a. Trainer card — a real generated image, not an embed trick

`/profile view` no longer shows stats/buddy/catches as embed text — it
renders a single PNG server-side (`src/utils/trainer-card.js`, via
`@napi-rs/canvas`) and attaches it as the embed's image. This was a
deliberate escalation from the type-banner approach in §5: banners are just
a bundled asset attached as-is, this actually draws a unique image per
request with a real Node canvas API (rounded rects, clipped circles,
gradients, per-row layout).

**Why `@napi-rs/canvas` over `node-canvas`:** ships prebuilt binaries per
platform, so `npm install` on Railway's Linux container just works. Plain
`node-canvas` needs system Cairo/Pango at build time and is a common source
of broken Docker builds for exactly this kind of feature — avoided
entirely by not using it.

**Background color is derived from the trainer's `/profile edit colour`**
(defaults to `normal`/grey if unset) — a diagonal gradient from a darkened
to a lightened version of that type's hex (`TYPE_COLORS`), not a flat fill.
Text/panel ink color is picked per-render by a simple luma check
(`paletteFor()` in trainer-card.js) — light types (Electric, Ice, Fairy...)
get dark ink, dark types (Dark, Ghost, Poison...) get light ink. This is
necessary, not decorative: with the card's whole background now tied to an
arbitrary type color instead of a fixed dark neutral, hardcoding white text
would be unreadable on light types.

**No emoji glyphs are ever drawn on the canvas.** Railway's container has
no color-emoji font installed, so `ctx.fillText('✨')` silently renders as
a blank box — confirmed by hitting exactly this with a ★ character before
switching to a hand-drawn path (`drawStar()`). Anything "iconic" on the
card is either plain text/symbols any bundled font covers, or the bot's own
bundled type-icon PNGs drawn via `loadImage()` — never a Unicode emoji
codepoint. Custom Discord emoji (`<:name:id>`, used in embeds/buttons
elsewhere in this bot — see `TYPE_EMOJI`/`SHINY_EMOJI` in types.js) doesn't
apply here at all; those only resolve inside real Discord messages, not
inside a canvas-drawn image.

**Fonts are bundled, not system-installed**: `assets/fonts/` has
Unbounded (variable, display weight), Manrope (variable, body), and Space
Mono (two static weights — regular/bold, for tabular stat digits/CP
values). Pulled from Google's font source repo (raw TTF, not woff/woff2 —
`@napi-rs/canvas`'s `GlobalFonts.registerFromPath` wants ttf/otf/ttc).
Confirmed the variable-font weight selection actually works — `ctx.font =
'800 40px Unbounded'` really does pick the ExtraBold instance, verified by
rendering both 400 and 800 side by side and comparing.

**Avatar** is fetched fresh per render (`fetchBuffer()` + `loadImage()`)
from the trainer's real Discord avatar URL — falls back to a flat panel-color
circle if the fetch fails, rather than erroring the whole card out.

**Known rough edge**: if a trainer's buddy happens to share a type with
their own profile colour (e.g. a Dragon-type buddy on a Dragon-colored
card), the buddy chip's type dot for that type can visually blend into the
card background — the chip has its own translucent backing so it's not
unreadable, just low-contrast in that one coincidental case. Not fixed;
noted here so it isn't mistaken for a new bug later.

`/profile view` now calls `interaction.deferReply()` before rendering,
since the avatar fetch + draw can plausibly exceed Discord's 3s
interaction-ack window (this wasn't needed before, when the command did no
network I/O of its own beyond the DB).

## 6. Real bugs found during development (context for why some code looks defensive)

Worth knowing so you don't reintroduce these:

1. **`/profile` originally mixed a top-level `addUserOption` with
   subcommands** — Discord's API rejects this outright (all options must
   live under subcommands once any subcommand is defined). Fixed by
   moving the `trainer` option into the `view` subcommand only.
2. **`medals.js` initially imported `require('./roster')`** instead of
   `require('../data/roster')` — wrong relative path, would have crashed
   `/medals` on first real use. Caught by an actual `require()` in a test,
   not by reading the code.
3. **`removeMostRecentCatch(userId, pokemonId, shiny)` isn't event-scoped**
   — it deletes the most recent matching catch regardless of which event
   (or no event) it was tagged to. This is still used by nothing critical
   now, but a new `removeEventCatch(userId, pokemonId, shiny, eventId)`
   was added specifically for the interactive-events toggle logic to avoid
   this exact bug there. If you add more catch-removal UI, use the
   event-scoped version unless you specifically want the imprecise one.
4. **A test-mock bug, not a bot bug, but worth knowing if you write more
   tests**: a hand-rolled `discord.js` stub used for offline testing (see
   §7) had `ActionRowBuilder.addComponents()` *overwrite* instead of
   *append* — made it look like "Caught" buttons were vanishing behind
   "Shiny" buttons. The real discord.js doesn't do this; only the test
   double did. Fixed in the stub. If test output ever looks like
   components are disappearing, suspect the stub before the bot code.

## 7. Testing approach (no real Discord connection available in the build sandbox)

This bot was built and iterated entirely without the ability to
`npm install` real packages or connect to Discord's live API — the build
sandbox has no network access (confirmed via explicit 403s, not silent
timeouts). The workaround, which caught all four bugs above: hand-rolled
structural stubs for `discord.js` and `pg` (just enough surface —
`SlashCommandBuilder`, `EmbedBuilder`, `ActionRowBuilder`, `ButtonBuilder`,
a fake `Pool.query()`, etc. — to load-test real command modules and
actually execute their logic against mocked interactions).

If you have real npm/network access now, the honest move is to **replace
this testing approach with real integration tests** (a real test Discord
server + bot token, or at minimum `npm install` the real `discord.js` and
`pg` so tests run against real type-checking instead of a hand-maintained
stub that can itself have bugs, as #4 above demonstrates). The stub
approach was a sandbox limitation, not a design choice worth preserving.

## 8. Known gaps, stated plainly

1. Live ScrapedDuck integration is unverified (§4) — the single most
   important thing to check first.
2. eDPS covers 53 of 986 species; PVE tier for the rest is a coarse
   3-band estimate, not computed.
3. Interactive event buttons cap at 4 species — untested against an event
   with 5+.
4. No moderation beyond basic rate-limiting and CP-range validation on
   `/catch` — a determined user could still log fake catches within the
   rate limit.
5. Single-instance scheduler assumption — running more than one bot
   process would double-announce events. Fine at current scale.
6. Announcement banners are not yet implemented in the actual bot (only
   mocked up for a conversation reference image) — `scheduler.js`'s
   `buildAnnouncementEmbed()` doesn't call `.setImage()` yet.
