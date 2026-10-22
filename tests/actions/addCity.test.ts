import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';

describe('actions/addCity', () => {
  afterEach(() => {
    try {
      const inputMod = require('../../src/presentation/input');
      if (inputMod.rl) inputMod.rl.close();
      delete require.cache[require.resolve('../../src/presentation/input')];
    } catch {}
  });

  it('shows error when city name is empty', async () => {
    let showErrorCalled = false;
    let showErrorMsg = '';

    await import('../../src/actions/addCity').then(async (mod) => {
      await mod.addCity({
        ask: async () => '',
        searchCity: async () => null,
        fetchWeatherForCity: async () => ({ current: { temperature_2m: 20 } }),
        loadData: async () => ({ defaultCity: null, cities: [] }),
        saveData: async () => {},
        showError: (msg) => { showErrorCalled = true; showErrorMsg = msg; },
        showLoading: () => {},
        showWeather: () => {},
      });
    });

    assert.ok(showErrorCalled);
    assert.strictEqual(showErrorMsg, 'El nombre de la ciudad no puede estar vacío.');
  });

  it('shows error when city is not found via geocoding', async () => {
    let showErrorCalled = false;
    let showErrorMsg = '';

    await import('../../src/actions/addCity').then(async (mod) => {
      await mod.addCity({
        ask: async () => 'CiudadInexistente123',
        searchCity: async () => null,
        fetchWeatherForCity: async () => ({ current: { temperature_2m: 20 } }),
        loadData: async () => ({ defaultCity: null, cities: [] }),
        saveData: async () => {},
        showError: (msg) => { showErrorCalled = true; showErrorMsg = msg; },
        showLoading: () => {},
        showWeather: () => {},
      });
    });

    assert.ok(showErrorCalled);
    assert.strictEqual(showErrorMsg, 'No se encontró la ciudad: CiudadInexistente123');
  });

  it('shows error when city already exists', async () => {
    let showErrorCalled = false;
    let showErrorMsg = '';

    await import('../../src/actions/addCity').then(async (mod) => {
      await mod.addCity({
        ask: async () => 'Madrid',
        searchCity: async () => ({ name: 'Madrid', country: 'Spain', latitude: 40.4168, longitude: -3.7038 }),
        fetchWeatherForCity: async () => ({ current: { temperature_2m: 20 } }),
        loadData: async () => ({ defaultCity: null, cities: ['Madrid'] }),
        saveData: async () => {},
        showError: (msg) => { showErrorCalled = true; showErrorMsg = msg; },
        showLoading: () => {},
        showWeather: () => {},
      });
    });

    assert.ok(showErrorCalled);
    assert.strictEqual(showErrorMsg, 'La ciudad "Madrid" ya está registrada.');
  });

  it('successfully adds a new city and saves data', async () => {
    let saveDataCalled = false;
    let savedData: any;
    let showWeatherCity = '';
    let showWeatherTemp = 0;
    let showLoadingCalled = false;

    await import('../../src/actions/addCity').then(async (mod) => {
      await mod.addCity({
        ask: async () => 'Barcelona',
        searchCity: async () => ({ name: 'Barcelona', country: 'Spain', latitude: 41.3874, longitude: 2.1686 }),
        fetchWeatherForCity: async () => ({ current: { temperature_2m: 22 } }),
        loadData: async () => ({ defaultCity: null, cities: [] }),
        saveData: async (data) => { saveDataCalled = true; savedData = data; },
        showError: () => {},
        showLoading: () => { showLoadingCalled = true; },
        showWeather: (city, temp) => { showWeatherCity = city; showWeatherTemp = temp; },
      });
    });

    assert.ok(showLoadingCalled);
    assert.ok(saveDataCalled, 'saveData debería haber sido llamado');
    assert.deepStrictEqual(savedData.cities, ['Barcelona']);
    assert.strictEqual(showWeatherCity, 'Barcelona');
    assert.strictEqual(showWeatherTemp, 22);
  });

  it('handles API error with showError', async () => {
    let showErrorCalled = false;
    let showErrorMsg = '';

    await import('../../src/actions/addCity').then(async (mod) => {
      await mod.addCity({
        ask: async () => 'Madrid',
        searchCity: async () => ({ name: 'Madrid', country: 'Spain', latitude: 40.4168, longitude: -3.7038 }),
        fetchWeatherForCity: async () => { throw new Error('Network error'); },
        loadData: async () => ({ defaultCity: null, cities: [] }),
        saveData: async () => {},
        showError: (msg) => { showErrorCalled = true; showErrorMsg = msg; },
        showLoading: () => {},
        showWeather: () => {},
      });
    });

    assert.ok(showErrorCalled);
    assert.ok(showErrorMsg.includes('Network error'));
  });

  it('is case-insensitive when checking for duplicate cities', async () => {
    let showErrorCalled = false;

    await import('../../src/actions/addCity').then(async (mod) => {
      await mod.addCity({
        ask: async () => 'madrid',
        searchCity: async () => ({ name: 'Madrid', country: 'Spain', latitude: 40.4168, longitude: -3.7038 }),
        fetchWeatherForCity: async () => ({ current: { temperature_2m: 20 } }),
        loadData: async () => ({ defaultCity: null, cities: ['MADRID'] }),
        saveData: async () => {},
        showError: (msg) => { showErrorCalled = true; },
        showLoading: () => {},
        showWeather: () => {},
      });
    });

    assert.ok(showErrorCalled, 'debería detectar duplicado sin importar mayúsculas/minúsculas');
  });
});
