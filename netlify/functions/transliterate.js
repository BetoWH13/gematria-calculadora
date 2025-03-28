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

async function transliterateToHebrew(input) {
  const normalized = normalizeInput(input);
  console.log("🔍 Looking up:", normalized);

  const match = namesDB.find(entry => normalizeInput(entry.latin) === normalized);
  if (match) {
    return {
      hebrew: match.hebrew,
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

  return {
    hebrew: hebrewFallback,
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
