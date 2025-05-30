const express = require('express')
const path = require('path')

const app = express()

// Serve todos os arquivos estáticos dentro da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')))

// Define a route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/src/pages/index.html'))
});

app.get('/ping', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).send('URL is required');
    }

    const response = await fetch(targetUrl);
    const data = await response.text(); // pode usar .json() se for JSON

    // Copiar alguns headers importantes para a resposta (opcional)
    res.set('Content-Type', response.headers.get('content-type') || 'text/plain');
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro no proxy');
  }
})

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});