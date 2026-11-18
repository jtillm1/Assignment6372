/*
  Name: Jace Tillman
  Date: 11.17.2026
  CSC 372-01

  Creates the shared Postgres connection pool. Neon requires SSL.
*/
require('dotenv').config();
let { Pool } = require('pg');

let pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;