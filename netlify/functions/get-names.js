export async function handler(event) {
  const name = event.queryStringParameters.name || '';
  const fallbackParam = event.queryStringParameters.fallback === 'true';
  console.log("🚀 API call received:", name, "| fallback allowed:", fallbackParam);

  const result = await transliterateToHebrew(name, fallbackParam);
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
}
