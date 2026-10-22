import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

export interface Settings {
  temperatureUnit: 'celsius' | 'fahrenheit';
}

const DEFAULT_SETTINGS: Settings = {
  temperatureUnit: 'celsius',
};

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
}
