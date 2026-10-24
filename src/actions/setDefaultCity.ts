import { loadData, saveData } from '../storage/citiesStorage.js';
import { ask } from '../presentation/input.js';
import { showError, showSuccess } from '../presentation/output.js';

interface Dependencies {
  ask?: typeof import('../presentation/input.js').ask;
  loadData?: typeof import('../storage/citiesStorage.js').loadData;
  saveData?: typeof import('../storage/citiesStorage.js').saveData;
  showError?: typeof import('../presentation/output.js').showError;
  showSuccess?: typeof import('../presentation/output.js').showSuccess;
}

export async function setDefaultCity(deps?: Dependencies): Promise<void> {
  const _ask = deps?.ask ?? ask;
  const _loadData = deps?.loadData ?? (await import('../storage/citiesStorage.js')).loadData;
  const _saveData = deps?.saveData ?? saveData;
  const _showError = deps?.showError ?? showError;
  const _showSuccess = deps?.showSuccess ?? showSuccess;

  const data = await _loadData();

  if (data.cities.length === 0) {
    _showError('No hay ciudades registradas.');
    return;
  }

  console.clear();
  console.log('══════════════════════════════════════');
  console.log('     ESTABLECER CIUDAD DEFAULT');
  console.log('══════════════════════════════════════');
  console.log('Ciudades registradas:');

  data.cities.forEach((city, index) => {
    const defaultMarker = city === data.defaultCity ? ' (actual)' : '';
    console.log(`  ${index + 1}. ${city}${defaultMarker}`);
  });

  const choice = await _ask('\nNúmero de la ciudad default: ');
  const index = parseInt(choice, 10) - 1;

  if (isNaN(index) || index < 0 || index >= data.cities.length) {
    _showError('Opción inválida.');
    return;
  }

  data.defaultCity = data.cities[index];
  await _saveData(data);
  _showSuccess(`"${data.defaultCity}" es ahora la ciudad default.`);
}
