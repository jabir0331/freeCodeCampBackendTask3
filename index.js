require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const validUrl = require('valid-url');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// In-memory database for URLs
let urlDatabase = [];
let idCounter = 1;

// POST endpoint to shorten URLs
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  // Validate URL format
  if (!validUrl.isWebUri(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Check if URL already exists
  const existing = urlDatabase.find(item => item.original_url === originalUrl);
  if (existing) {
    return res.json(existing);
  }

  // Create new short URL entry
  const newEntry = {
    original_url: originalUrl,
    short_url: idCounter++
  };
  urlDatabase.push(newEntry);

  res.json(newEntry);
});

// GET endpoint to redirect to original URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = parseInt(req.params.short_url);
  const entry = urlDatabase.find(item => item.short_url === shortUrl);

  if (!entry) {
    return res.json({ error: 'No URL found for the given short_url' });
  }

  res.redirect(entry.original_url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
