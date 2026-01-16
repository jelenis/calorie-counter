import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export type Food = {
    server_id: number | null;
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


    const sql = `
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        
        /*
        DROP TABLE IF EXISTS entries;
        DROP TABLE IF EXISTS foods;
        DROP TABLE IF EXISTS days;
        */


        CREATE TABLE IF NOT EXISTS days (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL UNIQUE  -- YYYY-MM-DD
        );
        
        
        CREATE TABLE IF NOT EXISTS foods (
            id INTEGER PRIMARY KEY,
            server_id INTEGER,
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
        
            food_id INTEGER DEFAULT NULL,
        
            time TEXT NOT NULL DEFAULT 'snack',
            CHECK (time IN ('breakfast','lunch','dinner','snack')),
            FOREIGN KEY (day_id) REFERENCES days(id) ON DELETE CASCADE,
            FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY,
            calories INTEGER NOT NULL,
            protein INTEGER NOT NULL,
            carbs INTEGER NOT NULL,
            fat INTEGER NOT NULL,
            date TEXT NOT NULL UNIQUE
        );`;


    try {
        await db.execAsync(sql);
    } catch (e) {
        console.error('Error during DB initialization:', e);
    }
}

export async function getDateId(date: string | Date) {
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
    return dayId;
}

// Insert or update a food entry for a specific date
// if id exists, update the entry
export async function insertEntry(
    date: string | Date,
    entry: FoodEntry,
) {
    const db = await getDB();

    const dayId = await getDateId(date);

    // Insert food into foods table if it doesn't exist
    let result = await db.runAsync(
        `INSERT OR IGNORE INTO foods (
            server_id, 
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
            entry.id,
            entry.upc ?? null,
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
    // Insert or update entry
    result = await db.runAsync(
        `INSERT OR REPLACE INTO entries (
            id, quantity, day_id, food_id, time
        ) VALUES (?,?,?,?,?);`,
        [
            entry.id ?? null,
            entry.quantity ?? 1,
            dayId,
            result.lastInsertRowId,
            entry.time
        ]
    );
    console.log('Inserted/Updated entry with ID:', result.lastInsertRowId);
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
         JOIN days d ON e.day_id = d.id left JOIN foods f ON f.id = e.food_id 
         WHERE d.date = ? ORDER BY
          CASE e.time 
          WHEN 'breakfast' THEN 1 
          WHEN 'lunch' THEN 2 
          WHEN 'dinner' THEN 3 
          WHEN 'snack' THEN 4 
          ELSE 5 END, e.id ASC;`,
        date
    );

    return entries;
}

export async function saveMacros(calories: number, protein: number, carbs: number, fat: number) {
    const db = await getDB();
    const today = getDayKey(new Date());
    await db.runAsync(
        `INSERT INTO goals (date, calories, protein, carbs, fat)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(date) DO UPDATE SET
           calories = excluded.calories,
           protein  = excluded.protein,
           carbs    = excluded.carbs,
           fat      = excluded.fat;`,
        [today, calories, protein, carbs, fat]
    );
}

export async function getMacros(): Promise<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
} | null> {
    const db = await getDB();
    const today = getDayKey(new Date());
    const row = await db.getFirstAsync<{
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    }>(
        `SELECT calories, protein, carbs, fat FROM goals WHERE date = ?;`,
        today
    );
    if (!row) {
        // insert default macros
        await saveMacros(2000, 150, 250, 70);
        // recursive for now, going to improve later
        return await getMacros();
    }

    return row || null;
}   