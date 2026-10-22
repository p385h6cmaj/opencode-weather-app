import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';

describe('actions/forecast', () => {
  afterEach(() => {
    try {
      const inputMod = require('../../src/presentation/input');
      if (inputMod.rl) inputMod.rl.close();
      delete require.cache[require.resolve('../../src/presentation/input')];
    } catch {}
  });

  it('shows error when no cities are configured', async () => {
    let showErrorCalled = false;
    let showErrorMsg = '';

    await import('../../src/actions/forecast').then(async (mod) => {
      await mod.forecast({
        searchCity: async () => null,
        getWeather: async () => ({ current: { temperature_2m: 20 }, daily: { time: [] } }),
        loadData: async () => ({ defaultCity: null, cities: [] }),
        showError: (msg) => { showErrorCalled = true; showErrorMsg = msg; },
      });
    });

    assert.ok(showErrorCalled);
    assert.strictEqual(showErrorMsg, 'No hay ciudades configuradas. Agrega al menos una ciudad primero.');
  });

  it('uses cities list when available', async () => {
    let searchCityCalled = false;
    let consoleOutput: string[] = [];
    const originalLog = console.log;

    console.log = (...args) => { consoleOutput.push(args.join(' ')); };

    try {
      await import('../../src/actions/forecast').then(async (mod) => {
        await mod.forecast({
          searchCity: async () => { searchCityCalled = true; return ({ name: 'Madrid', country: '', latitude: 40.4168, longitude: -3.7038 }); },
          getWeather: async () => ({
            current: { temperature_2m: 20 },
            daily: {
              time: ['2026-10-21', '2026-10-22'],
              temperature_2m_min: [14, 13],
              temperature_2m_max: [26, 25],
              precipitation_probability_max: [30, 5],
              wind_speed_10m_max: [20, 18],
            },
          }),
          loadData: async () => ({ defaultCity: null, cities: ['Madrid', 'Barcelona'] }),
          showError: () => {},
        });
      });

      assert.ok(searchCityCalled, 'searchCity debería haber sido llamado');
    } finally {
      console.log = originalLog;
    }
  });

  it('uses defaultCity when cities list is empty', async () => {
    let searchCityCalled = false;

    await import('../../src/actions/forecast').then(async (mod) => {
      await mod.forecast({
        searchCity: async () => { searchCityCalled = true; return ({ name: 'Madrid', country: '', latitude: 40.4168, longitude: -3.7038 }); },
        getWeather: async () => ({ current: { temperature_2m: 20 }, daily: { time: [] } }),
        loadData: async () => ({ defaultCity: 'Madrid', cities: [] }),
        showError: () => {},
      });
    });

    assert.ok(searchCityCalled, 'searchCity debería haber sido llamado con defaultCity');
  });

  it('skips city when searchCity returns null', async () => {
    let consoleOutput: string[] = [];
    const originalLog = console.log;

    console.log = (...args) => { consoleOutput.push(args.join(' ')); };

    try {
      await import('../../src/actions/forecast').then(async (mod) => {
        await mod.forecast({
          searchCity: async () => null,
          getWeather: async () => ({ current: { temperature_2m: 20 }, daily: { time: [] } }),
          loadData: async () => ({ defaultCity: null, cities: ['CiudadInexistente'] }),
          showError: () => {},
        });
      });

      const hasNotFoundMsg = consoleOutput.some(line => line.includes('No se encontró la ciudad'));
      assert.ok(hasNotFoundMsg, 'debería mostrar mensaje de ciudad no encontrada');
    } finally {
      console.log = originalLog;
    }
  });

  it('handles API error with showError', async () => {
    let showErrorCalled = false;
    let showErrorMsg = '';

    await import('../../src/actions/forecast').then(async (mod) => {
      await mod.forecast({
        searchCity: async () => ({ name: 'Madrid', country: '', latitude: 40.4168, longitude: -3.7038 }),
        getWeather: async () => { throw new Error('Network error'); },
        loadData: async () => ({ defaultCity: null, cities: ['Madrid'] }),
        showError: (msg) => { showErrorCalled = true; showErrorMsg = msg; },
      });
    });

    assert.ok(showErrorCalled);
    assert.ok(showErrorMsg.includes('Network error'));
  });
});
