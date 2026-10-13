import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { Plugin } from "vite";
import { CONTACT_BODY_LIMIT, handleConfig, handleContact, type ContactDatabase, type ContactResult, type ContactStatement } from "./contact";
import { handleAdmin } from "./admin";

export class LocalStatement implements ContactStatement {
  private values: (string | number | null)[] = [];
  constructor(readonly database: DatabaseSync, readonly sql: string) {}
  bind(...values: (string | number | null)[]): ContactStatement { this.values = values; return this; }
  execute(): ContactResult {
    const results = this.database.prepare(this.sql).all(...this.values);
    const changed = this.database.prepare("SELECT changes() AS changes").get();
    return { success: true, results, meta: { changes: Number(changed?.changes ?? 0) } };
  }
  async run(): Promise<ContactResult> { return this.execute(); }
  async first<T = Record<string, unknown>>(): Promise<T | null> {
    return (this.database.prepare(this.sql).get(...this.values) as T | undefined) ?? null;
  }
}
export class LocalContactDatabase implements ContactDatabase {
  readonly sqlite: DatabaseSync;
  constructor(path: string) {
    this.sqlite = new DatabaseSync(path);
    this.sqlite.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;");
    this.sqlite.exec(readFileSync(resolve("migrations/0001_contact.sql"), "utf8"));
    this.sqlite.exec(readFileSync(resolve("migrations/0002_admin.sql"), "utf8"));
    this.sqlite.exec(readFileSync(resolve("migrations/0003_notifications.sql"), "utf8"));
  }
  prepare(sql: string): ContactStatement { return new LocalStatement(this.sqlite, sql); }
  async batch(statements: ContactStatement[]): Promise<ContactResult[]> {
    this.sqlite.exec("BEGIN IMMEDIATE");
    try {
      const results = statements.map(statement => {
        if (!(statement instanceof LocalStatement) || statement.database !== this.sqlite) throw new Error("Invalid statement");
        return statement.execute();
      });
      this.sqlite.exec("COMMIT");
      return results;
    } catch (error) { this.sqlite.exec("ROLLBACK"); throw error; }
  }
}
function loopback(address: string | undefined): boolean {
  return address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1";
}
export function localContactPlugin(): Plugin {
  return {
    name: "local-contact-api",
    apply: "serve",
    configureServer(server) {
      const directory = resolve(".local");
      mkdirSync(directory, { recursive: true, mode: 0o700 });
      chmodSync(directory, 0o700);
      const secretPath = resolve(directory, "contact-secrets.json");
      if (!existsSync(secretPath)) writeFileSync(secretPath, JSON.stringify({
        DATA_ENCRYPTION_KEY: randomBytes(32).toString("base64"),
        RATE_LIMIT_SECRET: randomBytes(32).toString("hex"),
      }), { mode: 0o600, flag: "wx" });
      chmodSync(secretPath, 0o600);
      const secrets = JSON.parse(readFileSync(secretPath, "utf8")) as { DATA_ENCRYPTION_KEY: string; RATE_LIMIT_SECRET: string };
      const databasePath = resolve(directory, "contact.sqlite");
      const database = new LocalContactDatabase(databasePath);
      chmodSync(databasePath, 0o600);
      server.httpServer?.once("close", () => database.sqlite.close());
      server.middlewares.use(async (incoming, outgoing, next) => {
        const path = incoming.url?.split("?")[0];
        const admin = ["/api/admin/session", "/api/admin/login", "/api/admin/logout", "/api/admin/inquiries"].includes(path || "");
        if (path !== "/api/contact" && path !== "/api/contact/config" && !admin) {
          if (path?.startsWith("/api/")) { outgoing.statusCode = 404; outgoing.end(); return; }
          return next();
        }
        const fail = (status: number, message: string) => {
          outgoing.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
          outgoing.end(JSON.stringify({ ok: false, error: message }));
        };
        if (!loopback(incoming.socket.remoteAddress)) return fail(403, "Local development only.");
        try {
          const url = new URL(incoming.url!, `http://${incoming.headers.host}`);
          if (!["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)) return fail(403, "Request not allowed.");
          const length = Number(incoming.headers["content-length"] || 0);
          if (!Number.isFinite(length) || length > CONTACT_BODY_LIMIT) return fail(413, "The request is too large.");
          const chunks: Buffer[] = [];
          let bytes = 0;
          incoming.setTimeout(5000, () => incoming.destroy());
          for await (const chunk of incoming) {
            bytes += chunk.length;
            if (bytes > CONTACT_BODY_LIMIT) return fail(413, "The request is too large.");
            chunks.push(Buffer.from(chunk));
          }
          incoming.setTimeout(0);
          const headers = new Headers();
          for (const [name, value] of Object.entries(incoming.headers)) {
            if (value && !["cf-connecting-ip", "x-forwarded-for"].includes(name)) headers.set(name, Array.isArray(value) ? value.join(",") : value);
          }
          const request = new Request(url, { method: incoming.method, headers,
            ...(!["GET", "HEAD"].includes(incoming.method || "GET") ? { body: Buffer.concat(chunks) } : {}) });
          const adminPath = resolve(directory, "admin-secrets.json");
          const adminSecrets = admin && existsSync(adminPath) ? JSON.parse(readFileSync(adminPath, "utf8")) as { ADMIN_PASSWORD_HASH: string } : {};
          const env = { DB: database, SITE_ORIGIN: url.origin, ...secrets, ...adminSecrets, LOCAL_DEVELOPMENT: true };
          const result = await (admin ? handleAdmin : path!.endsWith("/config") ? handleConfig : handleContact)(request, env);
          outgoing.writeHead(result.status, Object.fromEntries(result.headers));
          outgoing.end(Buffer.from(await result.arrayBuffer()));
        } catch { if (!outgoing.headersSent) fail(503, "The form is temporarily unavailable."); }
      });
    },
  };
}
