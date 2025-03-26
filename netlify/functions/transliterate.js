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

  // Simulated dictionary — you can expand this or connect to a real API later
  const simulatedDictionary = {
    "gabriel": "גבריאל",
    "sara": "שרה",
    "miguel": "מיגל",
    "david": "דוד",
    "elena": "אילנה",
    "moses": "משה"
  };

  const normalized = name.trim().toLowerCase();

  if (simulatedDictionary[normalized]) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        hebrew: simulatedDictionary[normalized],
        source: 'curated'
      })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      hebrew: null,
      source: 'not-found'
    })
  };
};
