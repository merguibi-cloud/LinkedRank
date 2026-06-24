import "dotenv/config";
import { createPostgresClient } from "../server/_core/database";

const sql = createPostgresClient();
const [pooler] = await sql`SELECT 1 AS ok`;
console.log("Pooler transaction (6543):", pooler.ok);
await sql.end();
