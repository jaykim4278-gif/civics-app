import Database from 'better-sqlite3';
try {
    const db = new Database('test.db');
    db.exec('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)');
    db.exec('INSERT INTO test (name) VALUES ("hello")');
    console.log('Database verification successful');
    db.close();
} catch (e) {
    console.error('Database verification failed:', e);
}
