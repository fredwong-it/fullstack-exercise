const express = require('express');
const fs = require('fs/promises');

const { DATA_PATH } = require('../utils/path');
const { itemSchema } = require('../schema/item');

const MIN_PAGE = 1;
const MIN_SIZE = 1;
const MAX_SIZE = 100;

const router = express.Router();

async function readData() {
  const raw = await fs.readFile(DATA_PATH);
  return JSON.parse(raw);
}

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();

    const page = Math.max(MIN_PAGE, parseInt(req.query.page ?? '1', 10));
    const size = Math.min(MAX_SIZE, Math.max(MIN_SIZE, parseInt(req.query.size ?? '50', 10)));
    const q = (req.query.q ?? '').toLowerCase();

    const filtered = q ? data.filter(item => (item.name ?? '').toLowerCase().includes(q)) : data;

    // pagination
    const start = (page - 1) * size;
    const items = filtered.slice(start, start + size);

    res.json({
      items,
      total: filtered.length,
      page,
      size
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', (req, res, next) => {
  try {
    const data = readData();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', (req, res, next) => {
  try {
    const parseResult = itemSchema.safeParse(req.body); // Validate payload

    if (!parseResult.success) {
      const errors = parseResult.error.issues.map(i => ({
        path: i.path.join('.'),
        message: i.message,
      }));
      return res.status(400).json({ errors });
    }

    const item = parseResult.data; // validated + parsed data
    const data = readData();

    item.id = Date.now();
    data.push(item);

    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;