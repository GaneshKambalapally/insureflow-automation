require('dotenv').config();
const { initDb, run } = require('./db');

async function reset() {
  await initDb();
  console.log('🔄 Resetting database...');
  run('DELETE FROM refunds');
  run('DELETE FROM claims');
  run('DELETE FROM payments');
  run('DELETE FROM policies');
  run('DELETE FROM users');
  console.log('✅ All tables cleared. Running seed...');
  require('./seed');
}

reset().catch(err => { console.error(err); process.exit(1); });
