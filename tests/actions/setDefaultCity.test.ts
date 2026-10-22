import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';

describe('actions/setDefaultCity', () => {
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

    await import('../../src/actions/setDefaultCity').then(async (mod) => {
      await mod.setDefaultCity({
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

  it('successfully sets a default city', async () => {
    let saveDataCalled = false;
    let savedData: any;
    let showSuccessCalled = false;
    let successMsg = '';

    await import('../../src/actions/setDefaultCity').then(async (mod) => {
      await mod.setDefaultCity({
        ask: async () => '2',
        loadData: async () => ({ defaultCity: null, cities: ['Madrid', 'Barcelona'] }),
        saveData: async (data) => { saveDataCalled = true; savedData = data; },
        showError: () => {},
        showSuccess: (msg) => { showSuccessCalled = true; successMsg = msg; },
      });
    });

    assert.ok(saveDataCalled, 'saveData debería haber sido llamado');
    assert.strictEqual(savedData.defaultCity, 'Barcelona');
    assert.ok(showSuccessCalled);
    assert.strictEqual(successMsg, '"Barcelona" es ahora la ciudad default.');
  });

  it('rejects invalid index input', async () => {
    let showErrorCalled = false;
    let showErrorMsg = '';

    await import('../../src/actions/setDefaultCity').then(async (mod) => {
      await mod.setDefaultCity({
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

    await import('../../src/actions/setDefaultCity').then(async (mod) => {
      await mod.setDefaultCity({
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

  it('changes default city from one to another', async () => {
    let savedData: any;

    await import('../../src/actions/setDefaultCity').then(async (mod) => {
      await mod.setDefaultCity({
        ask: async () => '1',
        loadData: async () => ({ defaultCity: 'Barcelona', cities: ['Madrid', 'Barcelona'] }),
        saveData: async (data) => { savedData = data; },
        showError: () => {},
        showSuccess: () => {},
      });
    });

    assert.strictEqual(savedData.defaultCity, 'Madrid');
  });
});
