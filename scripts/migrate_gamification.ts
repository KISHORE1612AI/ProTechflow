import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'migration_log.txt');

function log(message: string) {
    const msg = `${new Date().toISOString()} - ${message}\n`;
    console.log(message);
    fs.appendFileSync(logFile, msg);
}

async function migrate() {
    log("Starting migration...");

    // Try to load .env if it exists
    try {
        const dotenv = await import('dotenv');
        dotenv.config();
        log("Loaded dotenv.");
    } catch (e) {
        log("dotenv not found or failed to load.");
    }

    if (!process.env.DATABASE_URL) {
        log("ERROR: DATABASE_URL is not set.");
        process.exit(1);
    }

    try {
        // Dynamic import to ensure env vars are loaded first
        const { pool } = await import("../server/db");

        await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0 NOT NULL;
    `);
        log("Added xp column.");

        await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1 NOT NULL;
    `);
        log("Added level column.");

        log("Migration successful.");
        await pool.end();
    } catch (error: any) {
        log(`Migration failed: ${error.message}`);
        log(error.stack);
        process.exit(1);
    }
}

migrate();
