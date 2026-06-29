const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

async function runSeeds() {
  const { db } = require('../dist/config/database');
  const logger = require('../dist/config/logger').default;

  const seedsDir = path.resolve(__dirname, '..', 'database', 'seeds');
  const files = fs.readdirSync(seedsDir).filter(f => f.endsWith('.sql')).sort();

  logger.info(`Found ${files.length} seed files to execute`);

  for (const file of files) {
    const sql = fs.readFileSync(path.join(seedsDir, file), 'utf8');
    try {
      await db.raw(sql);
      logger.info(`✓ Executed: ${file}`);
    } catch (err) {
      logger.error(`✗ Failed: ${file} - ${err.message}`);
    }
  }

  await db.destroy();
  logger.info('Seeding complete');
}

runSeeds().catch(err => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
