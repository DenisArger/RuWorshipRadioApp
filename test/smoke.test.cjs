const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('stations config contains radioStation definition', () => {
  const src = fs.readFileSync('src/config/stations.ts', 'utf8');
  assert.ok(src.includes('export const radioStation'));
  assert.ok(src.includes('streams:'));
});
