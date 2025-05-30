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
      hebrewNikkud: match.hebrewNikkud || match.hebrew,
      meaning: match.meaning,
      source: 'verified'
    };
  }

  return {
    error: 'Nombre no reconocido. Por favor, verifica la ortografía.',
    source: 'unverified'
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

