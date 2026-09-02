// Production entrypoint for the CYCLONE backend.
// Seeds the database on first boot, then starts the Express server.
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.resolve('data', 'cyclone.db');

if (!fs.existsSync(dbPath)) {
  const seed = require('./dist/seed/index.js');
  seed
    .seed()
    .then(() => {
      console.log('[start.js] seed complete, starting server');
      startServer();
    })
    .catch((e) => {
      console.error('[start.js] seeding failed', e);
      process.exit(1);
    });
} else {
  startServer();
}

function startServer() {
  const app = require('./dist/index.js');
  if (app && typeof app.startServer === 'function') {
    app.startServer();
  } else {
    console.error('[start.js] dist/index.js did not export startServer — run `npm run build` first.');
    process.exit(1);
  }
}