const { createClient } = require('@libsql/client');
require('dotenv').config();

const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
  url,
  authToken
});

async function initDb() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS user (
        id TEXT NOT NULL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
    ) STRICT;
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS score (
        id TEXT NOT NULL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES user(id),
        score INTEGER NOT NULL,
        created_at INTEGER NOT NULL
    ) STRICT;
  `);
  console.log('Database initialized');
}

module.exports = {
  client,
  initDb
};
