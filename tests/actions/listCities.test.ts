import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';

describe('actions/listCities', () => {
  afterEach(() => {
    try {
      const inputMod = require('../../src/presentation/input');
      if (inputMod.rl) inputMod.rl.close();
      delete require.cache[require.resolve('../../src/presentation/input')];
    } catch {}
  });

  it('shows error when no cities are registered', async () => {
    let showErrorCalled = false;
    let showErrorMsg = '';

    await import('../../src/actions/listCities').then(async (mod) => {
      await mod.listCities({
        searchCity: async () => null,
        fetchWeatherForCity: async () => ({ current: { temperature_2m: 20 } }),
        loadData: async () => ({ defaultCity: null, cities: [] }),
        showError: (msg) => { showErrorCalled = true; showErrorMsg = msg; },
      });
    });

    assert.ok(showErrorCalled);
    assert.strictEqual(showErrorMsg, 'No hay ciudades registradas.');
  });

  it('displays weather for each city', async () => {
    let consoleOutput: string[] = [];
    const originalLog = console.log;

    console.log = (...args) => { consoleOutput.push(args.join(' ')); };

    try {
      await import('../../src/actions/listCities').then(async (mod) => {
        await mod.listCities({
          searchCity: async (name: string) => ({ name, country: '', latitude: 0, longitude: 0 }),
          fetchWeatherForCity: async () => ({ current: { temperature_2m: 25 } }),
          loadData: async () => ({ defaultCity: null, cities: ['Madrid', 'Barcelona'] }),
          showError: () => {},
        });
      });

      const hasMadrid = consoleOutput.some(line => line.includes('Madrid'));
      const hasBarcelona = consoleOutput.some(line => line.includes('Barcelona'));
      assert.ok(hasMadrid, 'debería mostrar Madrid');
      assert.ok(hasBarcelona, 'debería mostrar Barcelona');
    } finally {
      console.log = originalLog;
    }
  });

  it('handles city with country in display', async () => {
    let consoleOutput: string[] = [];
    const originalLog = console.log;

    console.log = (...args) => { consoleOutput.push(args.join(' ')); };

    try {
      await import('../../src/actions/listCities').then(async (mod) => {
        await mod.listCities({
          searchCity: async () => ({ name: 'Madrid', country: 'Spain', latitude: 0, longitude: 0 }),
          fetchWeatherForCity: async () => ({ current: { temperature_2m: 25 } }),
          loadData: async () => ({ defaultCity: null, cities: ['Madrid'] }),
          showError: () => {},
        });
      });

      const hasCountry = consoleOutput.some(line => line.includes('Spain'));
      assert.ok(hasCountry, 'debería mostrar el país');
    } finally {
      console.log = originalLog;
    }
  });

  it('shows error message when temperature cannot be obtained', async () => {
    let consoleOutput: string[] = [];
    const originalLog = console.log;

    console.log = (...args) => { consoleOutput.push(args.join(' ')); };

    try {
      await import('../../src/actions/listCities').then(async (mod) => {
        await mod.listCities({
          searchCity: async () => ({ name: 'Madrid', country: '', latitude: 0, longitude: 0 }),
          fetchWeatherForCity: async () => ({ current: undefined }),
          loadData: async () => ({ defaultCity: null, cities: ['Madrid'] }),
          showError: () => {},
        });
      });

      const hasTempError = consoleOutput.some(line => line.includes('No se pudo obtener la temperatura'));
      assert.ok(hasTempError, 'debería mostrar mensaje de error cuando no hay temperatura');
    } finally {
      console.log = originalLog;
    }
  });

  it('handles searchCity returning null gracefully', async () => {
    let consoleOutput: string[] = [];
    const originalLog = console.log;

    console.log = (...args) => { consoleOutput.push(args.join(' ')); };

    try {
      await import('../../src/actions/listCities').then(async (mod) => {
        await mod.listCities({
          searchCity: async () => null,
          fetchWeatherForCity: async () => ({ current: { temperature_2m: 20 } }),
          loadData: async () => ({ defaultCity: null, cities: ['CiudadInexistente'] }),
          showError: () => {},
        });
      });

      // Should not crash, just skip the city
      assert.ok(true);
    } finally {
      console.log = originalLog;
    }
  });

  it('handles API error per city without crashing', async () => {
    let consoleOutput: string[] = [];
    const originalLog = console.log;

    console.log = (...args) => { consoleOutput.push(args.join(' ')); };

    try {
      await import('../../src/actions/listCities').then(async (mod) => {
        await mod.listCities({
          searchCity: async () => ({ name: 'Madrid', country: '', latitude: 0, longitude: 0 }),
          fetchWeatherForCity: async () => { throw new Error('Network error'); },
          loadData: async () => ({ defaultCity: null, cities: ['Madrid'] }),
          showError: () => {},
        });
      });

      const hasApiError = consoleOutput.some(line => line.includes('Error al consultar'));
      assert.ok(hasApiError, 'debería mostrar mensaje de error de API');
    } finally {
      console.log = originalLog;
    }
  });
});
