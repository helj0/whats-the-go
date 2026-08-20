const { EVENTS } = require('../data/events');

function eventStatus(ev) {
  const now = Date.now();
  if (now < ev.start) return 'upcoming';
  if (now < ev.end) return 'live';
  return 'ended';
}

function liveEvents() { return EVENTS.filter(ev => eventStatus(ev) === 'live'); }
function upcomingEvents() { return EVENTS.filter(ev => eventStatus(ev) === 'upcoming'); }

function formatCountdown(ms) {
  if (ms < 0) ms = 0;
  const totalH = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (totalH >= 24) {
    const dd = Math.floor(totalH / 24), rh = totalH % 24;
    return `${dd}d ${rh}h`;
  }
  return `${totalH}h ${m}m`;
}

function formatRange(ev) {
  const s = new Date(ev.start), e = new Date(ev.end);
  const opts = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
  return `${s.toLocaleString('en-US', opts)} \u2192 ${e.toLocaleString('en-US', opts)}`;
}

function currentRaidBosses() {
  // dedup by pokemon id, keep the highest-weight (rarest) tier if it appears in multiple live events
  const byId = {};
  for (const ev of liveEvents()) {
    for (const rb of ev.raidBosses || []) {
      if (!byId[rb.id] || rb.weight > byId[rb.id].weight) {
        byId[rb.id] = { ...rb, eventTitle: ev.title, eventId: ev.id };
      }
    }
  }
  return Object.values(byId).sort((a, b) => b.weight - a.weight);
}

function currentWildSpawns() {
  const byId = {};
  for (const ev of liveEvents()) {
    for (const id of ev.wildSpawns || []) {
      if (!byId[id]) byId[id] = { id, eventTitle: ev.title, eventId: ev.id };
    }
  }
  return Object.values(byId);
}

module.exports = { eventStatus, liveEvents, upcomingEvents, formatCountdown, formatRange, currentRaidBosses, currentWildSpawns };
