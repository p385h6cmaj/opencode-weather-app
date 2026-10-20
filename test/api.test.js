const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

describe('api', () => {
  let originalFetch;

  beforeEach(() => {
    // Save original fetch
    originalFetch = global.fetch;

    // Set up mock fetch
    global.fetch = async (url) => {
      const urlStr = url instanceof URL ? url.toString() : url;

      if (urlStr.includes('geocoding-api.open-meteo.com')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            results: [
              {
                name: 'Madrid',
                country: 'Spain',
                latitude: 40.4168,
                longitude: -3.7038,
              },
            ],
          }),
        };
      }

      if (urlStr.includes('api.open-meteo.com/v1/forecast')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            current: {
              temperature_2m: 22.5,
            },
            daily: {
              date: ['2026-10-20', '2026-10-21', '2026-10-22'],
              temperature_2m_min: [12, 14, 13],
              temperature_2m_max: [24, 26, 25],
              precipitation_probability_max: [10, 30, 5],
              wind_speed_10m_max: [15, 20, 18],
            },
          }),
        };
      }

      return { ok: false, status: 404 };
    };
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
  });

  describe('searchCity', () => {
    it('returns city info when found', async () => {
      const { searchCity } = require('../src/lib/api');
      const result = await searchCity('Madrid');

      assert.ok(result);
      assert.strictEqual(result.name, 'Madrid');
      assert.strictEqual(result.country, 'Spain');
      assert.strictEqual(result.latitude, 40.4168);
      assert.strictEqual(result.longitude, -3.7038);
    });

    it('returns null when city is not found', async () => {
      // Override fetch for this specific test
      global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({ results: [] }),
      });

      const { searchCity } = require('../src/lib/api');
      const result = await searchCity('CiudadInexistente123');

      assert.strictEqual(result, null);
    });

    it('calls geocoding API with correct parameters', async () => {
      let capturedUrl;

      global.fetch = async (url) => {
        capturedUrl = url instanceof URL ? url : new URL(url);
        return {
          ok: true,
          status: 200,
          json: async () => ({ results: [] }),
        };
      };

      const { searchCity } = require('../src/lib/api');
      await searchCity('TestCity');

      assert.ok(capturedUrl);
      assert.strictEqual(capturedUrl.searchParams.get('name'), 'TestCity');
      assert.strictEqual(capturedUrl.searchParams.get('count'), '1');
      assert.strictEqual(capturedUrl.searchParams.get('language'), 'es');
      assert.strictEqual(capturedUrl.searchParams.get('format'), 'json');
    });
  });

  describe('getWeather', () => {
    it('returns weather data for given coordinates', async () => {
      const { getWeather } = require('../src/lib/api');
      const result = await getWeather(40.4168, -3.7038);

      assert.ok(result);
      assert.strictEqual(result.current.temperature_2m, 22.5);
    });

    it('includes daily forecast when params are provided', async () => {
      const { getWeather } = require('../src/lib/api');
      const result = await getWeather(40.4168, -3.7038, 'temperature_2m_min,temperature_2m_max');

      assert.ok(result.daily);
      assert.strictEqual(result.daily.date.length, 3);
    });

    it('calls forecast API with correct parameters', async () => {
      let capturedUrl;

      global.fetch = async (url) => {
        capturedUrl = url instanceof URL ? url : new URL(url);
        return {
          ok: true,
          status: 200,
          json: async () => ({ current: { temperature_2m: 20 } }),
        };
      };

      const { getWeather } = require('../src/lib/api');
      await getWeather(40.4168, -3.7038);

      assert.ok(capturedUrl);
      assert.strictEqual(capturedUrl.searchParams.get('latitude'), '40.4168');
      assert.strictEqual(capturedUrl.searchParams.get('longitude'), '-3.7038');
      assert.strictEqual(capturedUrl.searchParams.get('current'), 'temperature_2m');
    });

    it('throws on API error response', async () => {
      global.fetch = async () => ({ ok: false, status: 500 });

      const { getWeather } = require('../src/lib/api');

      await assert.rejects(
        async () => await getWeather(40.4168, -3.7038),
        { message: /Error en la API del clima/ }
      );
    });
  });

  describe('fetchWeatherForCity', () => {
    it('returns weather data for a city object', async () => {
      const { fetchWeatherForCity } = require('../src/lib/api');
      const cityInfo = { name: 'Madrid', latitude: 40.4168, longitude: -3.7038 };

      const result = await fetchWeatherForCity(cityInfo);

      assert.ok(result);
      assert.strictEqual(result.current.temperature_2m, 22.5);
    });
  });

  describe('geocodeCity', () => {
    it('returns raw geocoding API response', async () => {
      const { geocodeCity } = require('../src/lib/api');
      const result = await geocodeCity('Barcelona');

      assert.ok(result);
      assert.ok(result.results);
      assert.strictEqual(result.results.length, 1);
    });
  });
});
