import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

describe('api/geocoding', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('searchCity', () => {
    it('returns city info when found', async () => {
      global.fetch = async (url: string) => {
        assert.ok(url.includes('geocoding-api.open-meteo.com'));
        assert.ok(url.includes('name=Madrid'));
        assert.ok(url.includes('count=1'));
        assert.ok(url.includes('language=es'));

        return {
          ok: true,
          status: 200,
          json: async () => ({
            results: [{
              name: 'Madrid',
              country: 'Spain',
              latitude: 40.4168,
              longitude: -3.7038,
            }],
          }),
        };
      };

      const { searchCity } = await import('../../src/api/geocoding');
      const result = await searchCity('Madrid');

      assert.ok(result);
      assert.strictEqual(result.name, 'Madrid');
      assert.strictEqual(result.country, 'Spain');
      assert.strictEqual(result.latitude, 40.4168);
      assert.strictEqual(result.longitude, -3.7038);
    });

    it('returns null when city is not found', async () => {
      global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({ results: [] }),
      });

      const { searchCity } = await import('../../src/api/geocoding');
      const result = await searchCity('CiudadInexistente123');

      assert.strictEqual(result, null);
    });

    it('calls geocoding API with correct parameters', async () => {
      let capturedUrl: string;

      global.fetch = async (url) => {
        capturedUrl = url as string;
        return {
          ok: true,
          status: 200,
          json: async () => ({ results: [] }),
        };
      };

      const { searchCity } = await import('../../src/api/geocoding');
      await searchCity('TestCity');

      assert.ok(capturedUrl);
      const url = new URL(capturedUrl);
      assert.strictEqual(url.searchParams.get('name'), 'TestCity');
      assert.strictEqual(url.searchParams.get('count'), '1');
      assert.strictEqual(url.searchParams.get('language'), 'es');
      assert.strictEqual(url.searchParams.get('format'), 'json');
    });

    it('throws on API error response', async () => {
      global.fetch = async () => ({ ok: false, status: 500 });

      const { searchCity } = await import('../../src/api/geocoding');

      await assert.rejects(
        async () => await searchCity('Madrid'),
        /Error en la API de geocodificación/
      );
    });
  });

  describe('geocodeCity', () => {
    it('returns raw geocoding API response', async () => {
      global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          results: [{
            name: 'Barcelona',
            country: 'Spain',
            latitude: 41.3874,
            longitude: 2.1686,
          }],
        }),
      });

      const { geocodeCity } = await import('../../src/api/geocoding');
      const result = await geocodeCity('Barcelona');

      assert.ok(result);
      assert.ok(result.results);
      assert.strictEqual(result.results.length, 1);
      assert.strictEqual(result.results[0].name, 'Barcelona');
    });

    it('throws on API error response', async () => {
      global.fetch = async () => ({ ok: false, status: 404 });

      const { geocodeCity } = await import('../../src/api/geocoding');

      await assert.rejects(
        async () => await geocodeCity('Foo'),
        /Error en la API de geocodificación/
      );
    });
  });
});
