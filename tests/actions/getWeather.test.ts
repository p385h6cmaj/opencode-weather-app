import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';

describe('actions/getWeather', () => {
  afterEach(() => {
    // Clean up readline interface to prevent event loop hangs
    try {
      const inputMod = require('../../src/presentation/input');
      if (inputMod.rl) inputMod.rl.close();
      delete require.cache[require.resolve('../../src/presentation/input')];
    } catch {}
  });

  it('shows error when no default city is configured', async () => {
    let showErrorCalled = false;
    let showErrorMsg = '';

    await import('../../src/actions/getWeather').then(async (mod) => {
      await mod.getWeather({
        loadData: async () => ({ defaultCity: null, cities: [] }),
        searchCity: async () => null,
        fetchWeatherForCity: async () => ({ current: { temperature_2m: 20 } }),
        showError: (msg) => { showErrorCalled = true; showErrorMsg = msg; },
        showLoading: () => {},
        showWeather: () => {},
      });
    });

    assert.ok(showErrorCalled, 'showError debería haber sido llamado');
    assert.strictEqual(showErrorMsg, 'No hay ciudad default configurada.');
  });

  it('shows error when city is not found via geocoding', async () => {
    let showErrorCalled = false;
    let showErrorMsg = '';

    await import('../../src/actions/getWeather').then(async (mod) => {
      await mod.getWeather({
        loadData: async () => ({ defaultCity: 'CiudadInexistente', cities: [] }),
        searchCity: async () => null,
        fetchWeatherForCity: async () => ({ current: { temperature_2m: 20 } }),
        showError: (msg) => { showErrorCalled = true; showErrorMsg = msg; },
        showLoading: () => {},
        showWeather: () => {},
      });
    });

    assert.ok(showErrorCalled, 'showError debería haber sido llamado');
    assert.strictEqual(showErrorMsg, 'No se encontró la ciudad: CiudadInexistente');
  });

  it('shows weather when city is found successfully', async () => {
    let showWeatherCity = '';
    let showWeatherTemp = 0;
    let showWeatherCountry = '';
    let showLoadingCalled = false;

    await import('../../src/actions/getWeather').then(async (mod) => {
      await mod.getWeather({
        loadData: async () => ({ defaultCity: 'Madrid', cities: ['Madrid'] }),
        searchCity: async () => ({ name: 'Madrid', country: 'Spain', latitude: 40.4168, longitude: -3.7038 }),
        fetchWeatherForCity: async () => ({ current: { temperature_2m: 25 } }),
        showError: () => {},
        showLoading: () => { showLoadingCalled = true; },
        showWeather: (city, temp, country) => { showWeatherCity = city; showWeatherTemp = temp; showWeatherCountry = country; },
      });
    });

    assert.ok(showLoadingCalled, 'showLoading debería haber sido llamado');
    assert.strictEqual(showWeatherCity, 'Madrid');
    assert.strictEqual(showWeatherTemp, 25);
    assert.strictEqual(showWeatherCountry, 'Spain');
  });

  it('handles API error with showError', async () => {
    let showErrorCalled = false;
    let showErrorMsg = '';

    await import('../../src/actions/getWeather').then(async (mod) => {
      await mod.getWeather({
        loadData: async () => ({ defaultCity: 'Madrid', cities: [] }),
        searchCity: async () => ({ name: 'Madrid', country: 'Spain', latitude: 40.4168, longitude: -3.7038 }),
        fetchWeatherForCity: async () => { throw new Error('Network error'); },
        showError: (msg) => { showErrorCalled = true; showErrorMsg = msg; },
        showLoading: () => {},
        showWeather: () => {},
      });
    });

    assert.ok(showErrorCalled, 'showError debería haber sido llamado');
    assert.ok(showErrorMsg.includes('Network error'));
  });

  it('handles null temperature gracefully', async () => {
    let showWeatherTemp = 0;

    await import('../../src/actions/getWeather').then(async (mod) => {
      await mod.getWeather({
        loadData: async () => ({ defaultCity: 'Madrid', cities: [] }),
        searchCity: async () => ({ name: 'Madrid', country: 'Spain', latitude: 40.4168, longitude: -3.7038 }),
        fetchWeatherForCity: async () => ({ current: undefined }),
        showError: () => {},
        showLoading: () => {},
        showWeather: (_city, temp) => { showWeatherTemp = temp; },
      });
    });

    assert.strictEqual(showWeatherTemp, null);
  });
});
