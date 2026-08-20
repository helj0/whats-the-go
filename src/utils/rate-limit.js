// Simple in-memory sliding-window rate limiter. Resets on process restart —
// that's fine here, this is anti-spam, not a security boundary. Keyed by
// whatever string you pass in (e.g. `catch:${userId}`), so different
// commands can share this without colliding.

const buckets = new Map();

/**
 * Records a call and returns true if the caller has exceeded `maxCalls`
 * within the trailing `windowMs`.
 */
function isRateLimited(key, maxCalls, windowMs) {
  const now = Date.now();
  const timestamps = (buckets.get(key) || []).filter(t => now - t < windowMs);
  timestamps.push(now);
  buckets.set(key, timestamps);
  return timestamps.length > maxCalls;
}

// Periodic cleanup so this doesn't grow forever for a long-running process.
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of buckets.entries()) {
    const fresh = timestamps.filter(t => now - t < 10 * 60 * 1000);
    if (fresh.length === 0) buckets.delete(key);
    else buckets.set(key, fresh);
  }
}, 5 * 60 * 1000).unref();

module.exports = { isRateLimited };
