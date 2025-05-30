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

// Normalize input for consistent matching
function normalizeInput(str) {
  return str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

// Basic Levenshtein distance function
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

// Suggest closest known name by Latin key
function suggestClosestName(input) {
  const normalized = normalizeInput(input);
  let closest = null;
  let minDist = Infinity;

  for (const entry of namesDB) {
    const normEntry = normalizeInput(entry.latin);
    const dist = levenshtein(normEntry, normalized);
    if (dist < minDist) {
      closest = entry;
      minDist = dist;
    }
  }

  return minDist <= 2 ? closest.latin : null;
}

// Main logic
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

  const suggestion = suggestClosestName(normalized);

  return {
    error: suggestion
      ? `Nombre no reconocido. ¿Quisiste decir "${suggestion}"?`
      : 'Nombre no reconocido. Por favor, verifica la ortografía.',
    source: 'unverified'
  };
}

// Netlify Function Handler
export async function handler(event) {
  const name = event.queryStringParameters.name || '';
  console.log("🚀 API call received:", name);

  const result = await transliterateToHebrew(name);
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
}

// Also export core for local testing
export { transliterateToHebrew };


