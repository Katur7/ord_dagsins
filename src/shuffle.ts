import fs from 'fs';

// Utility: simple deterministic pseudo-random generator (LCG)
function seededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;

  return function() {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

// Utility: hash a string (e.g., the date) into a numeric seed
function hashStringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// Deterministic shuffle using seeded RNG (Fisher–Yates)
function deterministicShuffle(array: any[], seed: number): any[] {
  const rng = seededRandom(seed);
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const json = fs.readFileSync('./processed/filtered.json', 'utf-8');
const words = JSON.parse(json);

const seed = hashStringToSeed('WORD');
const shuffledArray = deterministicShuffle(words, seed);

const shuffledJson = JSON.stringify(shuffledArray, null, 2);
fs.writeFileSync('./processed/shuffled.json', shuffledJson, 'utf-8');
