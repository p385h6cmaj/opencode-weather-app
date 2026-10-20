# Weather CLI App

## Repo state
- **Source code** lives in `src/`. Entry point is `index.js` (stub that requires `./src/index`).
- Single package, CommonJS (`"type": "commonjs"`).
- No tests, lint, or formatter configured.

## What it builds
- Node.js CLI app that queries [OpenMeteo](https://open-meteo.com/) for weather data and produces an executable binary.
- Two-step API flow:
  1. **Geocoding API** — `https://geocoding-api.open-meteo.com/v1/search?name=<city>&count=1&language=es&format=json`
  2. **Forecast API** — `https://api.open-meteo.com/v1/forecast?latitude=<lat>&longitude=<lon>&current=temperature_2m`

## Commands
```bash
npm init -y          # already done (package.json exists)
node index.js        # run CLI once source exists
```

## Constraints
- Spanish-language geocoding (`language=es`).
- Menu-driven CLI with city management (default, multiple cities, delete).
- Output in °C.
