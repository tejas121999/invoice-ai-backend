const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

const host = process.env.DB_HOST || 'localhost';
const port = parseInt(process.env.DB_PORT, 10) || 3306;
const database = process.env.DB_NAME;
const username = process.env.DB_USER;
const password = process.env.DB_PASSWORD ?? '';
const dialect = (process.env.DB_DIALECT || 'mysql').trim();

function assertSafeDbName(name) {
  if (!name || typeof name !== 'string' || !/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error(
      '[database] DB_NAME must be set and contain only letters, numbers, and underscores.',
    );
  }
  return name;
}

/**
 * Connects without a default schema and creates the database if it does not exist.
 * @param {{ verbose?: boolean }} [options]
 */
async function ensureDatabaseExists(options = {}) {
  const { verbose = false } = options;
  const dbName = assertSafeDbName(database);
  const connection = await mysql.createConnection({
    host,
    port,
    user: username,
    password,
  });
  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    if (verbose) {
      console.log(`[database] Database "${dbName}" is ready (created if missing).`);
    }
  } finally {
    await connection.end();
  }
}

const sequelize = new Sequelize(database, username, password, {
  host,
  port,
  dialect,
  dialectModule: require('mysql2'),
  logging: false,
});

/**
 * @param {{ verbose?: boolean }} [options]
 * @returns {Promise<boolean>}
 */
async function testConnection(options = {}) {
  const { verbose = false } = options;
  try {
    await sequelize.authenticate();
    if (verbose) {
      console.log('[database] Connection established successfully.');
    }
    return true;
  } catch (err) {
    if (verbose) {
      console.error('[database] Unable to connect:', err.message);
    }
    return false;
  }
}

module.exports = { sequelize, testConnection, ensureDatabaseExists };
