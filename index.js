#!/usr/bin/env node

const { spawnSync } = require('child_process');
spawnSync('tsx', ['src/index.ts'], { cwd: __dirname, stdio: 'inherit' });
