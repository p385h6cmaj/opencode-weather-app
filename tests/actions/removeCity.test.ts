import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';

describe('actions/removeCity', () => {
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

    await import('../../src/actions/removeCity').then(async (mod) => {
      await mod.removeCity({
        ask: async () => '1',
        loadData: async () => ({ defaultCity: null, cities: [] }),
        saveData: async () => {},
        showError: (msg) => { showErrorCalled = true; showErrorMsg = msg; },
        showSuccess: () => {},
      });
    });

    assert.ok(showErrorCalled);
    assert.strictEqual(showErrorMsg, 'No hay ciudades registradas.');
  });

  it('successfully removes a city from the list', async () => {
    let saveDataCalled = false;
    let savedData: any;
    let showSuccessCalled = false;
    let successMsg = '';

    await import('../../src/actions/removeCity').then(async (mod) => {
      await mod.removeCity({
        ask: async () => '1',
        loadData: async () => ({ defaultCity: null, cities: ['Madrid', 'Barcelona'] }),
        saveData: async (data) => { saveDataCalled = true; savedData = data; },
        showError: () => {},
        showSuccess: (msg) => { showSuccessCalled = true; successMsg = msg; },
      });
    });

    assert.ok(saveDataCalled, 'saveData debería haber sido llamado');
    assert.deepStrictEqual(savedData.cities, ['Barcelona']);
    assert.ok(showSuccessCalled);
    assert.strictEqual(successMsg, '"Madrid" fue eliminada.');
  });

  it('clears defaultCity when removing the default city', async () => {
    let savedData: any;

    await import('../../src/actions/removeCity').then(async (mod) => {
      await mod.removeCity({
        ask: async () => '1',
        loadData: async () => ({ defaultCity: 'Madrid', cities: ['Madrid', 'Barcelona'] }),
        saveData: async (data) => { savedData = data; },
        showError: () => {},
        showSuccess: () => {},
      });
    });

    assert.strictEqual(savedData.defaultCity, null, 'defaultCity debería ser null');
    assert.deepStrictEqual(savedData.cities, ['Barcelona']);
  });

  it('rejects invalid index input', async () => {
    let showErrorCalled = false;
    let showErrorMsg = '';

    await import('../../src/actions/removeCity').then(async (mod) => {
      await mod.removeCity({
        ask: async () => '5',
        loadData: async () => ({ defaultCity: null, cities: ['Madrid'] }),
        saveData: async () => {},
        showError: (msg) => { showErrorCalled = true; showErrorMsg = msg; },
        showSuccess: () => {},
      });
    });

    assert.ok(showErrorCalled);
    assert.strictEqual(showErrorMsg, 'Opción inválida.');
  });

  it('rejects non-numeric input', async () => {
    let showErrorCalled = false;
    let showErrorMsg = '';

    await import('../../src/actions/removeCity').then(async (mod) => {
      await mod.removeCity({
        ask: async () => 'abc',
        loadData: async () => ({ defaultCity: null, cities: ['Madrid'] }),
        saveData: async () => {},
        showError: (msg) => { showErrorCalled = true; showErrorMsg = msg; },
        showSuccess: () => {},
      });
    });

    assert.ok(showErrorCalled);
    assert.strictEqual(showErrorMsg, 'Opción inválida.');
  });
});
