import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "../..");
const databasePath = path.join(projectRoot, "backend", "dev.db");
const backupDirectory = path.join(projectRoot, "backups");

if (!fs.existsSync(databasePath)) {
  throw new Error(`Database not found: ${databasePath}`);
}

fs.mkdirSync(backupDirectory, {
  recursive: true
});

const now = new Date();

const timestamp = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, "0"),
  String(now.getDate()).padStart(2, "0")
].join("-") +
  "-" +
  [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0")
  ].join("-");

const backupPath = path.join(
  backupDirectory,
  `mega-coat-backup-${timestamp}.db`
);

const database = new Database(databasePath);

try {
  await database.backup(backupPath);

  console.log(`Backup completed successfully.`);
  console.log(`Backup file: ${backupPath}`);
} finally {
  database.close();
}