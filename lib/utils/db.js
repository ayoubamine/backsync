const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function createTables(db) {
  await db.exec(
    "CREATE TABLE IF NOT EXISTS sync (type TEXT NOT NULL, file TEXT NOT NULL, date DATE NOT NULL DEFAULT (datetime('now','localtime')))"
  );
}

async function database() {
  const db = await open({
    filename: './backsync.db',
    driver: sqlite3.Database,
  });

  await createTables(db);

  return db;
}

module.exports = {
  async recordData(type, file) {
    const db = await database();

    await db.run('INSERT INTO sync (type, file) VALUES (?, ?)', type, file);

    await db.close();
  },
  async getData() {
    const db = await database();

    const result = await db.all('SELECT * FROM sync ORDER BY date DESC');

    await db.close();

    return result;
  },
};
