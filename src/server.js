require('dotenv').config();

const config = require('./config');
const { ensureDatabaseExists, testConnection } = require('./config/database');
const { ensureExtractedInvoiceHybridColumns } = require('./config/ensureExtractedInvoiceSchema');
const { syncDatabase } = require('./models');
const app = require('./app');

(async function start() {
  try {
    await ensureDatabaseExists({ verbose: true });
  } catch (err) {
    console.error('[database] Could not ensure database exists:', err.message);
    process.exit(1);
  }

  const connected = await testConnection({ verbose: true });
  if (!connected) {
    process.exit(1);
  }

  try {
    await syncDatabase();
    await ensureExtractedInvoiceHybridColumns();
  } catch (err) {
    console.error('[database] Sync failed:', err.message);
    process.exit(1);
  }

  app.listen(config.port, () => {
    console.log(`Server listening on http://localhost:${config.port}`);
  });
})();
