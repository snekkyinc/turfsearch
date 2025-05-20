const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// List of file extensions you want to check
const fileExtensions = ['html', 'php', 'txt', 'js', 'json'];

// Wordlist of common filenames or directories
const wordlist = [
  'index', 'contact', 'about', 'login', 'admin', 'robots', 'config', '.env', '.git/config'
];

// Build all possible paths combining wordlist and extensions
function buildPaths() {
  const paths = [];

  for (const word of wordlist) {
    if (word.endsWith('/')) {
      paths.push(word);
    } else if (word.includes('/')) {
      paths.push(word);
    } else {
      paths.push(word);
      for (const ext of fileExtensions) {
        paths.push(`${word}.${ext}`);
      }
    }
  }

  return paths;
}

const pathsToCheck = buildPaths();

const USER_AGENT = 'Mozilla/5.0 (compatible; PathScannerBot/1.0)';

app.post('/scan', async (req, res) => {
  const { url } = req.body;
  const results = [];

  if (!url || !/^https?:\/\//.test(url)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  for (const path of pathsToCheck) {
    const fullUrl = `${url.replace(/\/$/, '')}/${path}`;
    try {
      const response = await fetch(fullUrl, {
        method: 'HEAD',
        headers: { 'User-Agent': USER_AGENT }
      });
      results.push({ path: fullUrl, status: response.status });
    } catch (e) {
      results.push({ path: fullUrl, status: 'ERROR' });
    }
  }

  res.json({ results });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
