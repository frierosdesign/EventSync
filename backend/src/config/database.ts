import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

let db: Database<sqlite3.Database, sqlite3.Statement>;

export const initializeDatabase = async (): Promise<Database<sqlite3.Database, sqlite3.Statement>> => {
  try {
    // For development, use SQLite
    if (process.env.NODE_ENV !== 'production') {
      const dbPath = path.join(process.cwd(), 'eventsync.db');
      
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
      });

      console.log('📦 Connected to SQLite database');
    } else {
      // TODO: For production, implement PostgreSQL connection
      throw new Error('PostgreSQL connection not implemented yet');
    }

    await createTables();
    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

const createTables = async (): Promise<void> => {
  try {
    // Events table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        time TEXT,
        location TEXT,
        instagram_url TEXT NOT NULL UNIQUE,
        raw_content TEXT,
        extracted_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
      CREATE INDEX IF NOT EXISTS idx_events_instagram_url ON events(instagram_url);
      CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('Failed to create tables:', error);
    throw error;
  }
};

export const getDatabase = (): Database<sqlite3.Database, sqlite3.Statement> => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

// Graceful shutdown
process.on('SIGINT', async () => {
  if (db) {
    await db.close();
    console.log('📦 Database connection closed');
  }
  process.exit(0);
}); 