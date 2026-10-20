const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'cities.json');

async function loadData() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { defaultCity: null, cities: [] };
  }
}

async function saveData(data) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

module.exports = { loadData, saveData };
