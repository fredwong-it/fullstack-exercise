const express = require('express');
const fsp = require('fs/promises'); // async FS
const fs = require('fs');           // for fs.watch
const { DATA_PATH } = require('../utils/path');
const { mean } = require('../utils/stats');

// ---- Cache state ----
let statsCache = null;       // { total, averagePrice }
let statsMtimeMs = 0;        // last known mtime
let computing = null;        // Promise to dedupe concurrent recomputes

async function readItems() {
  const raw = await fsp.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function computeStats(items) {
  const total = items.length;
  const averagePrice = mean(items, (item) => item.price);

  return { total, averagePrice };
}

async function getStats() {
  const stat = await fsp.stat(DATA_PATH);
  const mtime = stat.mtimeMs;

  // cache hit
  if (statsCache && statsMtimeMs === mtime) return statsCache;

  // someone else is already recomputing; await it
  if (computing) {
    await computing;
    return statsCache;
  }

  // recompute and cache (deduped)
  computing = (async () => {
    const items = await readItems();
    statsCache = computeStats(items);
    statsMtimeMs = mtime;
  })();

  try {
    await computing;         // finish computation
  } finally {
    computing = null;        // allow future recomputes
  }

  return statsCache;
}

// Optional: proactively invalidate on file change
if (fs.existsSync(DATA_PATH)) {
  fs.watch(DATA_PATH, { persistent: false }, () => {
    statsCache = null;
    // statsMtimeMs will refresh on next getStats()
  });
}

const router = express.Router();

// GET /api/stats (cached)
router.get('/', async (req, res, next) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
