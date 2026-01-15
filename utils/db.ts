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
export type userFood = Omit<Food, 'id' | 'upc'>;

export type EmptyFoodEntry = Food & Partial<FoodEntry>;

export async function getDB() {
    if (db) return db;

    db = await SQLite.openDatabaseAsync('app.db');
    await initialize(db);

    return db;
}
// DROP TABLE IF EXISTS entries;
// DROP TABLE IF EXISTS foods;
// DROP TABLE IF EXISTS days;
// DROP TABLE IF EXISTS user_foods;
async function initialize(db: SQLite.SQLiteDatabase) {


    const sql = `
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        
        CREATE TABLE IF NOT EXISTS days (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL UNIQUE  -- YYYY-MM-DD
        );
        
        CREATE TABLE IF NOT EXISTS user_foods (
            id INTEGER PRIMARY KEY,
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
        
            food_id INTEGER DEFAULT NULL,
            user_food_id INTEGER DEFAULT NULL,
        
            time TEXT NOT NULL DEFAULT 'snack',
            CHECK (time IN ('breakfast','lunch','dinner','snack')),
            FOREIGN KEY (day_id) REFERENCES days(id) ON DELETE CASCADE,
            FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE,
            FOREIGN KEY (user_food_id) REFERENCES user_foods(id) ON DELETE CASCADE,
            CHECK (food_id IS NOT NULL OR user_food_id IS NOT NULL)
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
    console.log('Database initialized');
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

export async function insertUserFood(food: userFood): Promise<number | null> {
    const db = await getDB();

    // Insert food into foods table if it doesn't exist
    const dayId = await getDateId(new Date());
    try {
        let result = await db.runAsync(
            `INSERT OR IGNORE INTO user_foods (
            name, 
            calories, 
            category, 
            brand, 
            serving_size_g, 
            serving_text, 
            protein, 
            fat, 
            carbs
        ) VALUES ( ?, ?,  ?, ?, ?,  ?, ?, ?,  ?);`,
            [
                food.name,
                food.calories,
                food.category ?? null,
                food.brand ?? null,
                food.serving_size_g ?? null,
                food.serving_text ?? null,
                food.protein ?? null,
                food.fat ?? null,
                food.carbs ?? null
            ]
        );
        const entry = {
            ...food,
            user_food_id: result.lastInsertRowId,
            quantity: 1,
            time: 'snack' // will make this selectable later
        }
        result = await db.runAsync(
            `INSERT OR REPLACE INTO entries (
             quantity, day_id, user_food_id, time
        ) VALUES (?,?,?,?);`,
            [
                entry.quantity,
                dayId,
                entry.user_food_id,
                entry.time
            ]
        );

        const useFoodEntryId = result.lastInsertRowId;
        console.log('Inserted user food entry with ID:', useFoodEntryId);
        const foods = await db.getAllAsync<FoodEntry>(
            `SELECT DISTINCT * from entries WHERE user_food_id IS NOT NULL;`,

        );
        console.log('All user food entries:', foods);


        return useFoodEntryId;
    } catch (e) {
        console.error('Error inserting user food:', e);
        return null;
    }
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
        `SELECT
        e.id,
        e.time,
        e.quantity,
        e.day_id,

        COALESCE(f.upc, NULL) as upc,
        COALESCE(f.name, uf.name) as name,
        COALESCE(f.calories, uf.calories) as calories,
        COALESCE(f.brand, uf.brand) as brand,
        COALESCE(f.serving_size_g, uf.serving_size_g) as serving_size_g,
        COALESCE(f.serving_text, uf.serving_text) as serving_text,
        COALESCE(f.protein, uf.protein) as protein,
        COALESCE(f.fat, uf.fat) as fat,
        COALESCE(f.carbs, uf.carbs) as carbs

        FROM entries e
        JOIN days d ON d.id = e.day_id
        LEFT JOIN foods f ON f.id = e.food_id
        LEFT JOIN user_foods uf ON uf.id = e.user_food_id
        WHERE d.date = ?
        ORDER BY
        CASE e.time
            WHEN 'breakfast' THEN 1
            WHEN 'lunch' THEN 2
            WHEN 'dinner' THEN 3
            WHEN 'snack' THEN 4
            ELSE 5
        END,
        e.id;`,
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