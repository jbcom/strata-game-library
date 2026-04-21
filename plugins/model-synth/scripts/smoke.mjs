#!/usr/bin/env node

import { ModelSynth } from '../dist/index.js';

const apiKey = process.env.MESHY_API_KEY;

if (!apiKey) {
  console.log('Skipping Meshy smoke test: MESHY_API_KEY is not set.');
  process.exit(0);
}

const synth = new ModelSynth({ apiKey });

const listTasks = await synth.text3d.listTasks(1, 1);
console.log(`Meshy auth/list smoke passed: received ${listTasks.length} task(s).`);

const shouldCreateCharacter = process.env.MESHY_SMOKE_CREATE_CHARACTER === '1';
const confirmedCosts = process.env.MESHY_SMOKE_CONFIRM_COSTS === '1';

if (!shouldCreateCharacter) {
  console.log('Set MESHY_SMOKE_CREATE_CHARACTER=1 to run the billable character workflow.');
  process.exit(0);
}

if (!confirmedCosts) {
  throw new Error(
    'Refusing billable Meshy generation without MESHY_SMOKE_CONFIRM_COSTS=1. ' +
      'The character workflow can consume preview, refine, rigging, and animation credits.'
  );
}

const poll = {
  maxRetries: Number(process.env.MESHY_SMOKE_MAX_RETRIES ?? 90),
  intervalMs: Number(process.env.MESHY_SMOKE_INTERVAL_MS ?? 10_000),
};

const character = await synth.character({
  prompt:
    process.env.MESHY_SMOKE_PROMPT ??
    'standard humanoid game character, simple biped, front-facing, textured, low poly',
  style: 'cartoon',
  rigged: true,
  animations: ['idle'],
  polycount: Number(process.env.MESHY_SMOKE_POLYCOUNT ?? 8000),
  heightMeters: Number(process.env.MESHY_SMOKE_HEIGHT_METERS ?? 1.7),
  refineOptions: {
    target_formats: ['glb'],
    auto_size: true,
  },
  poll,
});

if (!character.riggedModelUrls?.rigged) {
  throw new Error('Meshy character smoke failed: no rigged GLB URL returned.');
}

if (!character.animationUrls?.idle) {
  throw new Error('Meshy character smoke failed: no idle animation GLB URL returned.');
}

console.log('Meshy billable character smoke passed.');
console.log(`Model task: ${character.id}`);
console.log(`Preview task: ${character.previewTask?.id ?? 'n/a'}`);
console.log(`Rigging task: ${character.riggingTask?.id ?? 'n/a'}`);
