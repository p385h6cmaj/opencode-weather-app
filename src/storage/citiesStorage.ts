import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'cities.json');

export interface AppData {
  defaultCity: string | null;
  cities: string[];
}

export async function loadData(): Promise<AppData> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { defaultCity: null, cities: [] };
  }
}

export async function saveData(data: AppData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}
