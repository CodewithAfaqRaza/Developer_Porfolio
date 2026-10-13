import { DatabaseSync } from 'node:sqlite';
import { readFileSync, existsSync } from 'node:fs';
import { decryptInquiryPayload } from '../server/contact.ts';
import { CONTACT_RETENTION_DAYS } from '../shared/contact.ts';

const [action = 'list', argument] = process.argv.slice(2);
let rows;
let database;
let key;
if (process.env.CONTACT_EXPORT_PATH) {
  if (action !== 'list') throw new Error('Remote exports support reading only; delete/prune through your authenticated D1 account.');
  const exportData = JSON.parse(readFileSync(process.env.CONTACT_EXPORT_PATH, 'utf8'));
  rows = Array.isArray(exportData) ? exportData.flatMap(entry => Array.isArray(entry?.results) ? entry.results : [entry]) : exportData.results;
  if (!Array.isArray(rows)) throw new Error('Export must be a JSON array of id, created_at and payload rows.');
  key = process.env.DATA_ENCRYPTION_KEY;
} else {
  if (!existsSync('.local/contact.sqlite')) throw new Error('Run npm run dev and send an inquiry first.');
  key = JSON.parse(readFileSync('.local/contact-secrets.json', 'utf8')).DATA_ENCRYPTION_KEY;
  database = new DatabaseSync('.local/contact.sqlite');
  if (action === 'delete') {
    if (!argument || !/^[a-f0-9-]{36}$/.test(argument)) throw new Error('Supply the inquiry UUID to delete.');
    console.log(JSON.stringify(database.prepare('DELETE FROM contact_inquiries WHERE id = ?').run(argument)));
    database.close();process.exit(0);
  }
  if (action === 'prune') {
    const cutoff = Date.now() - CONTACT_RETENTION_DAYS * 86400000;
    const inquiries = database.prepare('DELETE FROM contact_inquiries WHERE created_at < ?').run(cutoff);
    const rates = database.prepare('DELETE FROM contact_rate_limits WHERE expires_at < ?').run(Date.now()-86400000);
    console.log(JSON.stringify({ inquiriesRemoved: inquiries.changes, rateRecordsRemoved: rates.changes }));
    database.close();process.exit(0);
  }
  if (action !== 'list') throw new Error('Use list, delete <UUID>, or prune.');
  rows = database.prepare('SELECT id, created_at, payload FROM contact_inquiries ORDER BY created_at DESC LIMIT 100').all();
}
if (!key) throw new Error('Set DATA_ENCRYPTION_KEY privately to decrypt an exported database.');
const inquiries = [];
for (const row of rows) {
  const inquiry = await decryptInquiryPayload(row.payload, key, row.id, row.created_at);
  inquiries.push({ reference: row.id, createdAt: new Date(row.created_at).toISOString(), ...inquiry });
}
console.log(JSON.stringify(inquiries, null, 2));
database?.close();
