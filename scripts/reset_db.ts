
import "dotenv/config";
import { pool } from "../server/db";

async function main() {
    console.log("Wiping public schema...");
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL is not set");
        process.exit(1);
    }

    try {
        await pool.query(`DROP SCHEMA public CASCADE`);
        await pool.query(`CREATE SCHEMA public`);
        console.log("Public schema wiped and recreated.");
    } catch (error) {
        console.error("Failed to wipe schema:", error);
        process.exit(1);
    }
    process.exit(0);
}

main();
