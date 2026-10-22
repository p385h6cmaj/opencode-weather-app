import { GEOCODING_API } from '../utils/constants';
import { City } from '../types/City';

interface GeocodeResult {
  results?: Array<{
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  }>;
}

export async function geocodeCity(cityName: string): Promise<GeocodeResult> {
  const url = new URL(GEOCODING_API);
  url.searchParams.set('name', cityName);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'es');
  url.searchParams.set('format', 'json');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Error en la API de geocodificación: ${response.status}`);
  }

  return response.json();
}

export async function searchCity(cityName: string): Promise<City | null> {
  const result = await geocodeCity(cityName);

  if (!result.results || result.results.length === 0) {
    return null;
  }

  const city = result.results[0];
  return {
    name: city.name,
    country: city.country || '',
    latitude: city.latitude,
    longitude: city.longitude,
  };
}
