const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid'); // Import the uuid library
const app = express();
const port = 3000;

// Create SQLite database and table
const db = new sqlite3.Database('userPreferences.db');
db.run(`
  CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    preference TEXT
  )
`);

app.use(express.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

// Endpoint to store user preferences
app.post('/api/store-preferences', (req, res) => {
  const { preference } = req.body;

  if (!preference) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  const userId = uuidv4(); // Generate a unique user ID (nonce)

  // Insert user preference into the database
  db.run('INSERT INTO user_preferences (user_id, preference) VALUES (?, ?)', [userId, preference], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.status(200).json({ message: 'User preferences stored successfully', userId });
  });
});

// Route for the root URL, serving an HTML page
app.get('/', (req, res) => {
    // Check if the userPreferenceSet and moreOptionsVisited cookies are present
    const userPreferenceSet = req.headers.cookie ? req.headers.cookie.includes('userPreferenceSet=true') : false;
    const moreOptionsVisited = req.headers.cookie ? req.headers.cookie.includes('moreOptionsVisited=true') : false;
  
    if (userPreferenceSet && moreOptionsVisited) {
      res.send('Welcome back!'); // You can customize this message or redirect to another page
    } else {
      res.sendFile('index.html', { root: __dirname + '/public' });
    }
  });
  

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
