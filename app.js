async function onUserSubmit() {
  const input = document.querySelector('#userInput').value.trim().toLowerCase();
  const resultArea = document.querySelector('#resultArea');
  resultArea.innerHTML = '';

  const res = await fetch(`/.netlify/functions/transliterate?name=${encodeURIComponent(input)}`);
  const result = await res.json();

  if (result.error) {
    showInvalidInputMessage(input, result.error);
    return;
  }

  renderValidResult(result);
}

function showInvalidInputMessage(input, errorMsg) {
  const resultArea = document.querySelector('#resultArea');
  resultArea.innerHTML = `
    <div class="mt-4 p-4 border border-red-300 bg-red-50 text-red-700 rounded">
      <strong>Error:</strong> "${input}" - ${errorMsg}<br/>
      Por favor revisa la ortografía o consulta la <a href="/nombres-validos" class="underline">lista de nombres aceptados</a>.
    </div>
  `;
}

function renderValidResult(result) {
  const { hebrew, hebrewNikkud, meaning } = result;
  const value = calculateGematria(hebrew); // Existing logic
  const total = value.reduce((sum, item) => sum + item.value, 0);

  const resultArea = document.querySelector('#resultArea');
  resultArea.innerHTML = `
    <p><strong>Palabra en hebreo:</strong> ${hebrewNikkud}</p>
    <p><strong>Valor Total:</strong> ${total}</p>
    <p class="text-sm text-gray-600">📘 Fuente: Diccionario validado</p>
    ${meaning ? `<p><em>Significado:</em> ${meaning}</p>` : ''}
    <table class="mt-4 border">
      <thead><tr><th>Letra</th><th>Valor</th></tr></thead>
      <tbody>
        ${value.map(pair => `<tr><td>${pair.letter}</td><td>${pair.value}</td></tr>`).join('')}
      </tbody>
    </table>
  `;
}
