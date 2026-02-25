#!/usr/bin/env node
const { spawn } = require('child_process');
const port = process.env.PORT || '3000';
const proc = spawn('npx', ['next', 'start', '-H', '0.0.0.0', '-p', port], {
  stdio: 'inherit',
  env: { ...process.env, PORT: port },
});
proc.on('exit', (code) => process.exit(code ?? 0));
