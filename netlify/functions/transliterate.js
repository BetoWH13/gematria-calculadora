async function transliterateToHebrew(input, allowFallback = false) {
  const normalized = normalizeInput(input);
  console.log("🔍 Looking up:", normalized);

  // 1. Exact match
  let match = namesDB.find(entry => normalizeInput(entry.latin) === normalized);

  // 2. Fuzzy match (distance <= 1)
  if (!match) {
    match = fuzzyMatch(normalized);
  }

  // 3. Return valid result if found
  if (match) {
    return {
      hebrew: match.hebrew,
      hebrewNikkud: match.hebrewNikkud || match.hebrew,
      meaning: match.meaning,
      source: 'verified'
    };
  }

  // 4. If fallback mode is disabled, block here
  if (!allowFallback) {
    return {
      hebrew: null,
      hebrewNikkud: null,
      meaning: null,
      source: 'invalid'
    };
  }

  // 5. Fallback transliteration (legacy mode)
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
