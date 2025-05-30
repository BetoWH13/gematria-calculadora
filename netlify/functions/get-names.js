// get-names.js
import names from './names-db.json';

export async function handler(event, context) {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // for local testing
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(names)
  };
}
