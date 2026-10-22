import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

describe('api/weather', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('getWeather', () => {
    it('returns weather data for given coordinates', async () => {
      global.fetch = async (url: string) => {
        assert.ok(url.includes('api.open-meteo.com/v1/forecast'));

        return {
          ok: true,
          status: 200,
          json: async () => ({
            current: { temperature_2m: 22.5 },
            daily: {
              time: ['2026-10-21', '2026-10-22'],
              temperature_2m_min: [14, 13],
              temperature_2m_max: [26, 25],
              precipitation_probability_max: [30, 5],
              wind_speed_10m_max: [20, 18],
            },
          }),
        };
      };

      const { getWeather } = await import('../../src/api/weather');
      const result = await getWeather(40.4168, -3.7038);

      assert.ok(result);
      assert.strictEqual(result.current.temperature_2m, 22.5);
    });

    it('includes daily forecast when params are provided', async () => {
      global.fetch = async (url: string) => {
        const u = new URL(url);
        assert.strictEqual(u.searchParams.get('daily'), 'temperature_2m_min,temperature_2m_max');

        return {
          ok: true,
          status: 200,
          json: async () => ({
            current: { temperature_2m: 20 },
            daily: {
              time: ['2026-10-21', '2026-10-22'],
              temperature_2m_min: [12, 14],
              temperature_2m_max: [24, 26],
            },
          }),
        };
      };

      const { getWeather } = await import('../../src/api/weather');
      const result = await getWeather(40.4168, -3.7038, 'temperature_2m_min,temperature_2m_max');

      assert.ok(result.daily);
      assert.strictEqual(result.daily.time.length, 2);
    });

    it('calls forecast API with correct parameters', async () => {
      let capturedUrl: string;

      global.fetch = async (url) => {
        capturedUrl = url as string;
        return {
          ok: true,
          status: 200,
          json: async () => ({ current: { temperature_2m: 20 } }),
        };
      };

      const { getWeather } = await import('../../src/api/weather');
      await getWeather(40.4168, -3.7038);

      assert.ok(capturedUrl);
      const url = new URL(capturedUrl);
      assert.strictEqual(url.searchParams.get('latitude'), '40.4168');
      assert.strictEqual(url.searchParams.get('longitude'), '-3.7038');
      assert.strictEqual(url.searchParams.get('current'), 'temperature_2m');
    });

    it('throws on API error response', async () => {
      global.fetch = async () => ({ ok: false, status: 500 });

      const { getWeather } = await import('../../src/api/weather');

      await assert.rejects(
        async () => await getWeather(40.4168, -3.7038),
        /Error en la API del clima/
      );
    });
  });

  describe('fetchWeatherForCity', () => {
    it('returns weather data for a city object', async () => {
      global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          current: { temperature_2m: 18.3 },
        }),
      });

      const { fetchWeatherForCity } = await import('../../src/api/weather');
      const city = { name: 'Madrid', country: 'Spain', latitude: 40.4168, longitude: -3.7038 };
      const result = await fetchWeatherForCity(city);

      assert.ok(result);
      assert.strictEqual(result.current.temperature_2m, 18.3);
    });
  });
});
