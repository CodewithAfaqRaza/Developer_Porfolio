import { createClient } from '@libsql/client/web';
import type { Client, InStatement, ResultSet } from '@libsql/client';
import type { ContactDatabase, ContactResult, ContactStatement } from './contact.ts';

function result(set: ResultSet): ContactResult {
  return { success: true, results: set.rows.map(row => Object.fromEntries(set.columns.map(column => [column, row[column]]))), meta: { changes: set.rowsAffected } };
}
class Statement implements ContactStatement {
  readonly database: LibsqlDatabase;
  readonly sql: string;
  private args: (string | number | null)[] = [];
  constructor(database: LibsqlDatabase, sql: string) { this.database = database; this.sql = sql; }
  bind(...args: (string | number | null)[]): ContactStatement { this.args = args; return this; }
  query(): InStatement { return { sql: this.sql, args: this.args }; }
  async run(): Promise<ContactResult> { return result(await this.database.client.execute(this.query())); }
  async first<T>(): Promise<T | null> { return ((await this.run()).results?.[0] as T | undefined) ?? null; }
}
/** Preserves the same atomic batch contract as D1; no filesystem database in serverless functions. */
export class LibsqlDatabase implements ContactDatabase {
  readonly client: Client;
  constructor(client: Client) { this.client = client; }
  prepare(sql: string): ContactStatement { return new Statement(this, sql); }
  async batch(statements: ContactStatement[]): Promise<ContactResult[]> {
    const queries = statements.map(statement => {
      if (!(statement instanceof Statement) || statement.database !== this) throw new Error('Invalid database statement');
      return statement.query();
    });
    return (await this.client.batch(queries, 'write')).map(result);
  }
}
export function productionDatabase(env: Record<string, string | undefined>): LibsqlDatabase {
  const url = new URL(env.TURSO_DATABASE_URL || '');
  if (!['libsql:', 'https:'].includes(url.protocol) || !url.hostname.endsWith('.turso.io') || url.username || url.password || url.port
    || url.pathname !== '' && url.pathname !== '/' || url.search || url.hash || !env.TURSO_AUTH_TOKEN) throw new Error('Database configuration unavailable');
  const client = createClient({ url: url.href, authToken: env.TURSO_AUTH_TOKEN, intMode: 'number',
    fetch: (input: RequestInfo | URL, options?: RequestInit) => fetch(input, { ...options, signal: AbortSignal.any([...(options?.signal ? [options.signal] : []), AbortSignal.timeout(10_000)]) }),
  });
  return new LibsqlDatabase(client);
}
