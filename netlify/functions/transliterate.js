// /netlify/functions/transliterate.js

const curatedNames = {
  "abraham": { hebrew: "אברהם", meaning: "Padre de multitudes" },
  "sarah": { hebrew: "שרה", meaning: "Princesa" },
  "isaac": { hebrew: "יצחק", meaning: "Él reirá" },
  "jacob": { hebrew: "יעקב", meaning: "Sujeta el talón" },
  "moses": { hebrew: "משה", meaning: "Sacado de las aguas" },
  "aaron": { hebrew: "אהרן", meaning: "Montaña de fuerza" },
  "joseph": { hebrew: "יוסף", meaning: "Él añadirá" },
  "david": { hebrew: "דוד", meaning: "Amado" },
  "solomon": { hebrew: "שלמה", meaning: "Paz" },
  "ruth": { hebrew: "רות", meaning: "Amistad" },
  "esther": { hebrew: "אסתר", meaning: "Estrella" },
  "miriam": { hebrew: "מרים", meaning: "Rebeldía" },
  "levi": { hebrew: "לוי", meaning: "Unido" },
  "benjamin": { hebrew: "בנימין", meaning: "Hijo de la mano derecha" },
  "daniel": { hebrew: "דניאל", meaning: "Dios es mi juez" },
  "elijah": { hebrew: "אליהו", meaning: "Mi Dios es Yahveh" },
  "jonah": { hebrew: "יונה", meaning: "Paloma" },
  "noah": { hebrew: "נח", meaning: "Descanso" },
  "samuel": { hebrew: "שמואל", meaning: "Nombre de Dios" },
  "nathan": { hebrew: "נתן", meaning: "Él dio" },
  "rebecca": { hebrew: "רבקה", meaning: "Atar, unir" },
  "raquel": { hebrew: "רחל", meaning: "Oveja" },
  "isaiah": { hebrew: "ישעיהו", meaning: "Salvación de Yahveh" },
  "jeremiah": { hebrew: "ירמיהו", meaning: "Yahveh exaltará" },
  "ezekiel": { hebrew: "יחזקאל", meaning: "Dios fortalecerá" },
  "job": { hebrew: "איוב", meaning: "Odiado, perseguido" },
  "shira": { hebrew: "שירה", meaning: "Canción" },
  "yael": { hebrew: "יעל", meaning: "Cabra montés" },
  "tamar": { hebrew: "תמר", meaning: "Palmera" },
  "lior": { hebrew: "ליאור", meaning: "Mi luz" },
  "noa": { hebrew: "נועה", meaning: "Movimiento" },
  "eden": { hebrew: "עדן", meaning: "Delicia" },
  "ilan": { hebrew: "אילן", meaning: "Árbol" },
  "ori": { hebrew: "אורי", meaning: "Mi luz" },
  "ron": { hebrew: "רון", meaning: "Alegría" },
  "neta": { hebrew: "נטע", meaning: "Planta" },
  "amir": { hebrew: "אמיר", meaning: "Cima de un árbol" },
  "ziv": { hebrew: "זיו", meaning: "Brillo" },
  "tal": { hebrew: "טל", meaning: "Rocío" }
};

exports.handler = async function(event, context) {
  const { name } = event.queryStringParameters;

  if (!name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No name provided' })
    };
  }

  const normalized = name.trim().toLowerCase();

  if (curatedNames[normalized]) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        hebrew: curatedNames[normalized].hebrew,
        meaning: curatedNames[normalized].meaning,
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
