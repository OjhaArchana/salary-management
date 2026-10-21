import { openDb } from "../db";
import { generateEmployees } from "./generate";
import { insertEmployees } from "./insert";

const count = Number(process.env.SEED_COUNT) || 10000;
const db = openDb(process.env.DB_PATH);

const started = Date.now();
db.exec("DELETE FROM employees"); 
insertEmployees(db, generateEmployees(count));

console.log(`Seeded ${count} employees in ${Date.now() - started} ms`);