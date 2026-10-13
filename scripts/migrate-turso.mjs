import { readFileSync } from 'node:fs';
import { productionDatabase } from '../server/libsql.ts';
const database = productionDatabase(process.env);
try {
  for (const migration of ['0001_contact.sql', '0002_admin.sql', '0003_notifications.sql']) {
    const sql = readFileSync(`migrations/${migration}`, 'utf8').replace(/^--.*$/gm, '');
    const statements = sql.split(';').map(statement => statement.trim()).filter(Boolean);
    await database.batch(statements.map(statement => database.prepare(statement)));
    console.log(`Applied ${migration}`);
  }
} finally { database.client.close(); }
