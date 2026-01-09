import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export type FoodEntry = {
    id: number;
    name: string;
    calories: number;
    category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    protein?: number;
    fat?: number;
    carbs?: number;
};


export async function getDB() {
    if (db) return db;

    db = await SQLite.openDatabaseAsync('app.db');
    await initialize(db);

    return db;
}

async function initialize(db: SQLite.SQLiteDatabase) {
    await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    DROP TABLE IF EXISTS days;
    DROP TABLE IF EXISTS entries;

    CREATE TABLE IF NOT EXISTS days (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE  -- YYYY-MM-DD
    );
    CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        calories INTEGER NOT NULL,

        category TEXT NOT NULL DEFAULT 'snack'
            CHECK (category IN ('breakfast','lunch','dinner','snack')),

        protein REAL,
        fat REAL,
        carbs REAL,

        FOREIGN KEY (day_id) REFERENCES days(id) ON DELETE CASCADE /* when a day is deleted, delete its entries as well */
    );
        

    DELETE FROM days;
    DELETE FROM entries;

  `);

    const today = new Date();

    await insertEntry(today, 'Scrambled Eggs', 280, 'breakfast');
    await insertEntry(today, 'Whole Wheat Toast', 180, 'breakfast');
    await insertEntry(today, 'Orange Juice', 110, 'breakfast');

    await insertEntry(today, 'Turkey Sandwich', 420, 'lunch');
    await insertEntry(today, 'Baked Chips', 160, 'lunch');

    await insertEntry(today, 'Steak', 720, 'dinner');
    await insertEntry(today, 'Mashed Potatoes', 320, 'dinner');
    await insertEntry(today, 'Green Beans', 90, 'dinner');

    await insertEntry(today, 'Dark Chocolate', 180, 'snack');
    await insertEntry(today, 'Almonds', 170, 'snack');
}

export async function insertEntry(date: string | Date, name: string, calories: number, category: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'snack') {
    const db = await getDB();

    if (date instanceof Date) {
        date = getDayKey(date);
    }

    await db.runAsync(
        'INSERT OR IGNORE INTO days (date) VALUES (?);',
        date
    );

    let rows = await db.getAllAsync<{ id: number }>(
        'SELECT id FROM days WHERE date = ?;',
        date
    );

    await db.runAsync(
        'INSERT OR IGNORE INTO entries (day_id, name, calories, category) VALUES (?, ?, ?, ?);',
        [rows[0].id, name, calories, category]
    );
    rows = await db.getAllAsync<{ id: number }>(
        'SELECT id FROM days WHERE date = ?;',
        date
    );

    return rows[0].id;
}

export function getDayKey(date: Date): string {
    return date.toISOString().slice(0, 10); // "2026-01-08"
}

export async function getEntriesByDate(date: string | Date): Promise<FoodEntry[]> {
    const db = await getDB();

    if (date instanceof Date) {
        date = getDayKey(date);
    }

    const entries = await db.getAllAsync<{
        id: number;
        name: string;
        calories: number;
        category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
        protein?: number;
        fat?: number;
        carbs?: number;
    }>(
        `SELECT e.id, e.name, e.calories, e.category, e.protein, e.fat, e.carbs FROM entries e
         JOIN days d ON e.day_id = d.id
         WHERE d.date = ? 
         ORDER BY CASE e.category
            WHEN 'breakfast' THEN 1
            WHEN 'lunch' THEN 2
            WHEN 'dinner' THEN 3
            WHEN 'snack' THEN 4
            ELSE 5
         END, e.id ASC;`,
        date
    );

    return entries;
}

