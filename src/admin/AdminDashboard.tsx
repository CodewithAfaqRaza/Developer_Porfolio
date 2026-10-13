import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { TurnstileWidget } from '../components/contact/TurnstileWidget';
import './admin.css';
import { profile, profileInitials } from '../data/profile';
import { BUDGET_OPTIONS, CONTACT_RETENTION_DAYS } from '../../shared/contact';

type Inquiry = { id: string; createdAt: number; details: {
  name: string; email: string; phone?: string | null; country: string;
  kind?: string; description: string; budget: string; budgetCurrency: string;
}};
type Session = { authenticated: boolean; local: boolean; siteKey: string | null };
type Cursor = { before: number; id: string } | null;
const budgets: Record<string, string> = Object.fromEntries(BUDGET_OPTIONS);
async function api(path: string, body?: object) {
  const response = await fetch(`/api/admin/${path}`, {
    credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(15_000),
    ...(body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(data.error || 'Request failed.'), { status: response.status });
  return data;
}
export default function AdminDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [reset, setReset] = useState(0);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [next, setNext] = useState<Cursor>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const generation = useRef(0);
  const clear = useCallback(() => {
    generation.current++;
    setSession(current => current ? { ...current, authenticated: false } : current);
    setInquiries([]); setNext(null); setSelected(null); setQuery(''); setPassword(''); setToken('');
  }, []);
  const check = useCallback(async () => {
    try {
      const data: Session = await api('session');
      if (!data.authenticated) clear();
      setSession(data);
    } catch (cause) {
      clear();
      setError(cause instanceof Error ? cause.message : 'Could not connect to the dashboard.');
    }
  }, [clear]);
  useEffect(() => {
    document.title = `Private inbox — ${profile.name}`;
    const robots = document.createElement('meta'); robots.name = 'robots'; robots.content = 'noindex, nofollow';
    document.head.append(robots);
    void check();
    return () => robots.remove();
  }, [check]);
  useEffect(() => {
    if (!session?.authenticated) return;
    const timer = window.setInterval(() => { void check(); }, 60_000);
    const focus = () => { void check(); };
    window.addEventListener('focus', focus);
    return () => { clearInterval(timer); window.removeEventListener('focus', focus); };
  }, [session?.authenticated, check]);
  const load = useCallback(async (cursor: Cursor = null) => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    const version = generation.current;
    try {
      const suffix = cursor ? `?before=${cursor.before}&id=${encodeURIComponent(cursor.id)}` : '';
      const data: { inquiries: Inquiry[]; next: Cursor } = await api(`inquiries${suffix}`);
      if (generation.current !== version) return;
      setInquiries(current => cursor ? [...current, ...data.inquiries] : data.inquiries);
      setNext(data.next);
      if (!cursor) setSelected(data.inquiries[0]?.id || null);
    } catch (cause) {
      if ((cause as { status?: number }).status === 401) clear();
      setError(cause instanceof Error ? cause.message : 'Could not load submissions.');
    } finally { pending.current = false; setBusy(false); }
  }, [clear]);
  useEffect(() => { if (session?.authenticated) void load(); }, [session?.authenticated, load]);
  async function login(event: FormEvent) {
    event.preventDefault(); if (pending.current || !token) return;
    pending.current = true; setBusy(true); setError('');
    try { await api('login', { password, turnstileToken: token }); setPassword(''); await check(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Login failed.'); }
    finally { pending.current = false; setBusy(false); setToken(''); setReset(value => value + 1); }
  }
  async function logout() {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try { await api('logout', {}); clear(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Logout failed. Please retry.'); }
    finally { pending.current = false; setBusy(false); }
  }
  const filter = query.trim().toLowerCase();
  const visible = inquiries.filter(row => [row.details.name, row.details.email, row.details.country, row.details.description].some(value => value.toLowerCase().includes(filter)));
  const active = inquiries.find(row => row.id === selected);
  const country = (code: string) => new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code;
  return <main className="admin-page">
    <header className="admin-header"><a href="/">{profileInitials} / Portfolio</a><span>Private workspace</span></header>
    {!session?.authenticated ? <section className="admin-login" aria-labelledby="login-title">
      <p className="admin-eyebrow">Owner access</p><h1 id="login-title">Your inbox.<br />Behind closed doors.</h1>
      <p>Log in to review project and collaboration enquiries.</p>
      {error && <p className="admin-error" role="alert">{error}</p>}
      {session ? <form onSubmit={login}>
        <label htmlFor="admin-password">Owner password</label>
        <input id="admin-password" name="password" type="password" autoComplete="current-password" required minLength={32} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} />
        {session.local ? <label className="admin-check"><input type="checkbox" checked={Boolean(token)} onChange={e => setToken(e.target.checked ? 'local-development-only' : '')} />Verify this local login</label>
          : session.siteKey && <TurnstileWidget siteKey={session.siteKey} action="admin-login" resetVersion={reset} onToken={setToken} />}
        <button type="submit" disabled={busy || !token}>{busy ? 'Logging in…' : 'Log in →'}</button>
        {session.local && <small>Local development: verification is simulated. Production requires CAPTCHA.</small>}
      </form> : <><p role="status">{error ? 'Dashboard setup or connection needs attention.' : 'Checking your session…'}</p><button onClick={() => void check()}>Retry connection</button></>}
    </section> : <section className="admin-workspace" aria-labelledby="inbox-title">
      <div className="admin-toolbar"><div><p className="admin-eyebrow">Contact submissions</p><h1 id="inbox-title">The inbox.</h1><p>{inquiries.length} loaded · newest first</p></div>
        <div className="admin-actions"><button disabled={busy} onClick={() => void load()}>Refresh</button><button disabled={busy} onClick={() => void logout()}>Log out</button></div></div>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <label htmlFor="admin-search">Search loaded submissions</label><input id="admin-search" type="search" placeholder="Name, email, country or project…" value={query} onChange={e => setQuery(e.target.value)} />
      <div className="admin-inbox"><aside className="admin-list" aria-label="Submissions">
        {busy && <p role="status">Loading…</p>}
        {!busy && !visible.length && <p>{inquiries.length ? 'No matching submissions.' : 'No submissions yet. New enquiries will appear here.'}</p>}
        {visible.map(row => <button key={row.id} className={selected === row.id ? 'is-selected' : ''} aria-pressed={selected === row.id} onClick={() => setSelected(row.id)}>
          <span>{row.details.kind || 'Inquiry'}</span><strong>{row.details.name}</strong><small>{row.details.email}</small><time dateTime={new Date(row.createdAt).toISOString()}>{new Date(row.createdAt).toLocaleDateString()}</time>
        </button>)}
        {next && <button disabled={busy} className="admin-more" onClick={() => void load(next)}>Load older submissions</button>}
      </aside><article className="admin-detail" aria-label="Submission details">
        {active ? <><p className="admin-eyebrow">{active.details.kind || 'Inquiry'}</p><h2>{active.details.name}</h2><p>{new Date(active.createdAt).toLocaleString()}</p>
          <dl><dt>Email</dt><dd>{active.details.email}</dd>{active.details.phone !== undefined && <><dt>Phone</dt><dd>{active.details.phone || 'Not provided'}</dd></>}<dt>Country</dt><dd>{country(active.details.country)}</dd><dt>Budget ({active.details.budgetCurrency})</dt><dd>{budgets[active.details.budget] || active.details.budget}</dd></dl>
          <h3>Project / collaboration</h3><p className="admin-description">{active.details.description}</p><p className="admin-reference">Reference: {active.id}</p>
        </> : <p>Select an enquiry to see its details.</p>}
      </article></div>
      <p className="admin-footnote">Private session · expires after one hour · submissions expire after {CONTACT_RETENTION_DAYS} days</p>
    </section>}
  </main>;
}
