// transliterate.js

import fs from 'fs';
import path from 'path';

let namesDB = [];

try {
  const dbPath = path.resolve(__dirname, 'names-db.json');
  const raw = fs.readFileSync(dbPath, 'utf-8');
  namesDB = JSON.parse(raw);
  console.log("✅ Loaded", namesDB.length, "names into the transliteration engine.");
} catch (err) {
  console.error('❌ Error loading names DB:', err);
}

const multiLetterMap = {
  'tz': 'צ', 'sh': 'ש', 'kh': 'ח', 'ch': 'ח', 'th': 'ת',
  'ph': 'פ', 'aa': 'א', 'oo': 'ו', 'ei': 'ע', 'ai': 'ע', 'ou': 'ו'
};

const singleLetterMap = {
  'a': 'א', 'b': 'ב', 'c': 'ק', 'd': 'ד', 'e': 'ע', 'f': 'פ',
  'g': 'ג', 'h': 'ה', 'i': 'י', 'j': 'י', 'k': 'כ', 'l': 'ל',
  'm': 'מ', 'n': 'נ', 'o': 'ו', 'p': 'פ', 'q': 'ק', 'r': 'ר',
  's': 'ס', 't': 'ת', 'u': 'ו', 'v': 'ב', 'w': 'ו', 'x': 'קס',
  'y': 'י', 'z': 'ז'
};

function normalizeInput(str) {
  return str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

function applyFinalLetterRules(word) {
  const finalMap = {
    'כ': 'ך',
    'מ': 'ם',
    'נ': 'ן',
    'פ': 'ף',
    'צ': 'ץ'
  };
  if (word.length === 0) return word;
  const last = word[word.length - 1];
  if (finalMap[last]) {
    return word.slice(0, -1) + finalMap[last];
  }
  return word;
}

function fuzzyMatch(input) {
  const maxDistance = 2;

  function levenshtein(a, b) {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[b.length][a.length];
  }

  const normalized = normalizeInput(input);
  let closest = null;
  let minDist = Infinity;

  for (const entry of namesDB) {
    const dist = levenshtein(normalizeInput(entry.latin), normalized);
    if (dist <= maxDistance && dist < minDist) {
      closest = entry;
      minDist = dist;
    }
  }
  return closest;
}

async function transliterateToHebrew(input) {
  const normalized = normalizeInput(input);
  console.log("🔍 Looking up:", normalized);

  let match = namesDB.find(entry => normalizeInput(entry.latin) === normalized);
  if (!match) {
    match = fuzzyMatch(normalized);
  }

  if (match) {
    return {
      hebrew: match.hebrew,
      hebrewNikkud: match.hebrewNikkud || match.hebrew,
      meaning: match.meaning,
      source: 'verified'
    };
  }

  let hebrewFallback = '';
  let i = 0;
  while (i < normalized.length) {
    const two = normalized.slice(i, i + 2);
    const one = normalized[i];

    if (multiLetterMap[two]) {
      hebrewFallback += multiLetterMap[two];
      i += 2;
    } else if (singleLetterMap[one]) {
      hebrewFallback += singleLetterMap[one];
      i += 1;
    } else {
      i += 1;
    }
  }

  hebrewFallback = applyFinalLetterRules(hebrewFallback);

  return {
    hebrew: hebrewFallback,
    hebrewNikkud: hebrewFallback,
    meaning: null,
    source: 'fallback'
  };
}

export async function handler(event) {
  const name = event.queryStringParameters.name || '';
  console.log("🚀 API call received:", name);

  const result = await transliterateToHebrew(name);
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
}

export { transliterateToHebrew };
