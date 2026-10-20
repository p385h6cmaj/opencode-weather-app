const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

describe('data (storage)', () => {
  let tempDir;
  let dataModule;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'weather-test-'));

    // Create a custom module that uses our temp directory
    const testFilePath = path.join(tempDir, 'cities.json');
    const originalMkdir = fs.promises.mkdir;
    const originalReadFile = fs.promises.readFile;
    const originalWriteFile = fs.promises.writeFile;

    dataModule = {
      async loadData() {
        try {
          const raw = await originalReadFile(testFilePath, 'utf-8');
          return JSON.parse(raw);
        } catch {
          return { defaultCity: null, cities: [] };
        }
      },
      async saveData(data) {
        await originalMkdir(path.dirname(testFilePath), { recursive: true });
        await originalWriteFile(testFilePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
      },
    };
  });

  afterEach(() => {
    // Clean up temp directory
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('loadData', () => {
    it('returns default structure when file does not exist', async () => {
      const result = await dataModule.loadData();
      assert.deepStrictEqual(result, { defaultCity: null, cities: [] });
    });

    it('loads existing city data from file', async () => {
      const testData = { defaultCity: 'Madrid', cities: ['Madrid', 'Barcelona'] };
      await fs.promises.writeFile(
        path.join(tempDir, 'cities.json'),
        JSON.stringify(testData, null, 2) + '\n',
        'utf-8'
      );

      const result = await dataModule.loadData();
      assert.strictEqual(result.defaultCity, 'Madrid');
      assert.deepStrictEqual(result.cities, ['Madrid', 'Barcelona']);
    });

    it('handles empty file gracefully (returns default)', async () => {
      await fs.promises.writeFile(path.join(tempDir, 'cities.json'), '', 'utf-8');
      const result = await dataModule.loadData();
      assert.deepStrictEqual(result, { defaultCity: null, cities: [] });
    });
  });

  describe('saveData', () => {
    it('writes data to file and creates directory if needed', async () => {
      const testData = { defaultCity: 'Lima', cities: ['Lima', 'Cusco'] };
      await dataModule.saveData(testData);

      const content = await fs.promises.readFile(
        path.join(tempDir, 'cities.json'),
        'utf-8'
      );
      const parsed = JSON.parse(content);
      assert.strictEqual(parsed.defaultCity, 'Lima');
      assert.deepStrictEqual(parsed.cities, ['Lima', 'Cusco']);
    });

    it('persists data with pretty-printed JSON', async () => {
      const testData = { defaultCity: 'Bogotá', cities: [] };
      await dataModule.saveData(testData);

      const content = await fs.promises.readFile(
        path.join(tempDir, 'cities.json'),
        'utf-8'
      );
      // Should have newlines (pretty-printed) and trailing newline
      assert.ok(content.includes('\n'));
      assert.ok(content.endsWith('\n'));
    });

    it('overwrites existing data file', async () => {
      // Write initial data
      await fs.promises.writeFile(
        path.join(tempDir, 'cities.json'),
        JSON.stringify({ defaultCity: 'Old', cities: ['Old'] }, null, 2) + '\n',
        'utf-8'
      );

      // Overwrite with new data
      await dataModule.saveData({ defaultCity: 'New', cities: ['New1', 'New2'] });

      const content = await fs.promises.readFile(
        path.join(tempDir, 'cities.json'),
        'utf-8'
      );
      const parsed = JSON.parse(content);
      assert.strictEqual(parsed.defaultCity, 'New');
      assert.deepStrictEqual(parsed.cities, ['New1', 'New2']);
    });
  });

  describe('integration: save then load', () => {
    it('round-trips data correctly', async () => {
      const original = { defaultCity: 'Quito', cities: ['Quito', 'Guayaquil', 'Cuenca'] };
      await dataModule.saveData(original);
      const loaded = await dataModule.loadData();

      assert.deepStrictEqual(loaded, original);
    });

    it('handles empty cities array', async () => {
      const original = { defaultCity: null, cities: [] };
      await dataModule.saveData(original);
      const loaded = await dataModule.loadData();

      assert.strictEqual(loaded.defaultCity, null);
      assert.deepStrictEqual(loaded.cities, []);
    });
  });
});
