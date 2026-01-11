import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export type Food = {
    id: number;
    upc?: string | null;
    name: string;
    brand?: string | null;
    category?: string | null;

    serving_size_g?: number | null;
    serving_text?: string | null;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
};


export type FoodEntry = Food & {
    id: number;
    food_id: number;
    time: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    quantity: number;
}

export type EmptyFoodEntry = Food & Partial<FoodEntry>;

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

 /* DROP TABLE IF EXISTS entries;
  DROP TABLE IF EXISTS foods;
  DROP TABLE IF EXISTS days; */

  CREATE TABLE IF NOT EXISTS days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE  -- YYYY-MM-DD
  );

  CREATE TABLE IF NOT EXISTS foods (
    id INTEGER PRIMARY KEY,
    upc TEXT,
    name TEXT NOT NULL,
    calories INTEGER NOT NULL,
    category TEXT,
    brand TEXT,
    serving_size_g REAL,
    serving_text TEXT,
    protein REAL,
    fat REAL,
    carbs REAL
  );

  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quantity INTEGER DEFAULT 1,
    day_id INTEGER NOT NULL,
    food_id INTEGER NOT NULL,
    time TEXT NOT NULL DEFAULT 'snack',
    CHECK (time IN ('breakfast','lunch','dinner','snack')),

    FOREIGN KEY (day_id) REFERENCES days(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
  );
`);
}
// Insert or update a food entry for a specific date
// if id exists, update the entry
export async function insertEntry(
    date: string | Date,
    entry: FoodEntry,
) {
    const db = await getDB();

    if (date instanceof Date) {
        date = getDayKey(date);
    }
    await db.runAsync(
        'INSERT OR IGNORE INTO days (date) VALUES (?);',
        date
    );

    const dayRow = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM days WHERE date = ?;',
        date
    );
    const dayId = dayRow?.id;
    if (!dayId) {
        throw new Error('Failed to retrieve day ID after insertion.');
    }
    await db.runAsync(
        `INSERT OR IGNORE INTO foods (
            id, 
            upc, 
            name, 
            calories, 
            category, 
            brand, 
            serving_size_g, 
            serving_text, 
            protein, 
            fat, 
            carbs
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
            entry.food_id,
            entry.upc ?? '',
            entry.name,
            entry.calories,
            entry.category ?? null,
            entry.brand ?? null,
            entry.serving_size_g ?? null,
            entry.serving_text ?? null,
            entry.protein ?? null,
            entry.fat ?? null,
            entry.carbs ?? null
        ]
    );


    const result = await db.runAsync(
        `INSERT OR REPLACE INTO entries (
            id, quantity, day_id, food_id, time
        ) VALUES (?,?,?,?,?);`,
        [
            entry.id,
            entry.quantity ?? 1,
            dayId,
            entry.food_id,
            entry.time
        ]
    );
    return result.lastInsertRowId;
}

export async function getRecents(): Promise<FoodEntry[]> {
    const db = await getDB();
    const foods = await db.getAllAsync<FoodEntry>(
        `SELECT DISTINCT f.*, e.food_id FROM foods f
         JOIN entries e ON e.food_id = f.id
         ORDER BY e.id DESC
         LIMIT 35;`
    );
    return foods;
}

export async function deleteEntry(entryId: number) {
    const db = await getDB();
    await db.runAsync(
        'DELETE FROM entries WHERE id = ?;',
        entryId
    );
}

export function getDayKey(date: Date): string {
    return date.toISOString().slice(0, 10); // "2026-01-08"
}

export async function getEntriesByDate(date: string | Date): Promise<FoodEntry[]> {
    const db = await getDB();

    if (date instanceof Date) {
        date = getDayKey(date);
    }

    const entries = await db.getAllAsync<FoodEntry>(
        `SELECT f.* ,e.* FROM entries e
         JOIN days d ON e.day_id = d.id
         JOIN foods f ON  f.id = e.food_id
         WHERE d.date = ? 
         ORDER BY CASE e.time
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

