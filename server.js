/*
  Name: Jace Tillman
  Date: 11.17.2026
  CSC 372-01

  Express entry point. Configures middleware and mounts the trivia router
  at /triviabook.
*/
require('dotenv').config();
let express = require('express');
let triviaRoutes = require('./routes/trivia-routes');

let app = express();
let port = process.env.PORT || 3000;

app.use(express.json());
app.use('/triviabook', triviaRoutes);

// Fallback for unknown routes
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.listen(port, () => console.log(`Triviabook listening on port ${port}`));