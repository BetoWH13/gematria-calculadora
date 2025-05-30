let cachedWords = null;

/**
 * Fetches the names DB from Netlify function (once)
 */
async function fetchNamesDB() {
  if (cachedWords) return cachedWords;

  const res = await fetch('/.netlify/functions/get-names');
  if (!res.ok) throw new Error('Failed to fetch names DB');
  cachedWords = await res.json();
  return cachedWords;
}

function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) =>
    Array.from({ length: a.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

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

/**
 * Validates Hebrew input against remote dataset
 * @param {string} input
 * @returns {Promise<Object>} validation result
 */
export async function validateHebrewWord(input) {
  const db = await fetchNamesDB();
  const clean = input.trim();

  const exact = db.find(entry => entry.hebrew === clean);
  if (exact) {
    return { valid: true, match: exact, suggestions: [] };
  }

  const suggestions = db
    .map(entry => ({
      word: entry.hebrew,
      label: entry.latin,
      meaning: entry.meaning,
      dist: levenshtein(clean, entry.hebrew)
    }))
    .filter(e => e.dist <= 2)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 5);

  return {
    valid: false,
    match: null,
    suggestions
  };
}
