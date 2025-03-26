// /netlify/functions/transliterate.js

const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const { name } = event.queryStringParameters;

  if (!name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No name provided' })
    };
  }

  const normalized = name.trim().toLowerCase();

  try {
    const sefariaRes = await fetch(`https://www.sefaria.org/api/name/${encodeURIComponent(normalized)}`);
    const sefariaData = await sefariaRes.json();

    if (sefariaData && sefariaData.he) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          hebrew: sefariaData.he,
          source: 'sefaria'
        })
      };
    }
  } catch (error) {
    console.error('Sefaria API error:', error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      hebrew: null,
      source: 'not-found'
    })
  };
};

