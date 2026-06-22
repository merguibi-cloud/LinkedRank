import fs from "node:fs";
import path from "node:path";

const schemaPath = path.resolve("drizzle/schema.ts");
let content = fs.readFileSync(schemaPath, "utf8");

content = content.replace(
  /import \{ int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean \} from "drizzle-orm\/mysql-core";/,
  `import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";`
);

content = content.replace(/mysqlTable\(/g, "pgTable(");
content = content.replace(/int\("id"\)\.autoincrement\(\)\.primaryKey\(\)/g, 'serial("id").primaryKey()');
content = content.replace(/int\(/g, "integer(");
content = content.replace(/\.onUpdateNow\(\)/g, ".$onUpdate(() => new Date())");

content = content.replace(
  /mysqlEnum\("(\w+)", (\[[^\]]+\])\)(\.default\([^)]+\))?(\.notNull\(\))?/g,
  (_match, col, values, def, notNull) => {
    const parsed = JSON.parse(values.replace(/'/g, '"'));
    const maxLen = Math.max(...parsed.map((v) => String(v).length), 16);
    return `varchar("${col}", { length: ${maxLen} })${def ?? ""}${notNull ?? ""}`;
  }
);

fs.writeFileSync(schemaPath, content);
console.log("Schema converti vers PostgreSQL:", schemaPath);
