
import "dotenv/config";
import { pool } from "../server/db";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function main() {
    console.log("Seeding admin user...");

    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL is not set");
        process.exit(1);
    }

    try {
        const hashedPassword = await hashPassword("admin123");

        // Check if admin exists
        const existing = await pool.query(`SELECT * FROM users WHERE username = 'admin'`);

        if (existing.rows.length === 0) {
            await pool.query(`
            INSERT INTO users (username, password, role, is_admin, is_approved, first_name, last_name, email)
            VALUES ($1, $2, 'admin', true, true, 'Admin', 'User', 'admin@example.com')
        `, ["admin", hashedPassword]);
            console.log("Admin user created: admin / admin123");
        } else {
            await pool.query(`
            UPDATE users SET is_admin = true, is_approved = true, password = $1 WHERE username = 'admin'
        `, [hashedPassword]);
            console.log("Admin user updated: admin / admin123");
        }

    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }

    console.log("Seeding successful.");
    process.exit(0);
}

main();
