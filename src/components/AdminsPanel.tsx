import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api } from '../lib/localApi';
import { Trash2 } from 'lucide-react';

type Row = { id: string; email: string; isYou?: boolean };

export default function AdminsPanel() {
  const [admins, setAdmins] = useState<Row[] | null>(null);
  const [invites, setInvites] = useState<Row[]>([]);
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/admin/admins');
      setAdmins(data.admins);
      setInvites(data.invites);
    } catch {
      setErr('Could not load the admin list.');
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const invite = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    try {
      await api.post('/api/admin/invites', { email });
      setMsg(`Invitation saved for ${email.trim().toLowerCase()}. Ask them to create an admin account with this email address.`);
      setEmail('');
      await load();
    } catch {
      setErr('Could not add that email. Check the address, and note that existing admins cannot be invited again.');
    }
  };

  const removeInvite = async (id: string) => {
    await api.delete(`/api/admin/invites/${id}`);
    await load();
  };

  const removeAdmin = async (id: string) => {
    if (!window.confirm('Remove this admin? They will lose access immediately.')) return;
    setErr('');
    try {
      await api.delete(`/api/admin/admins/${id}`);
      await load();
    } catch {
      setErr('Could not remove that admin. You cannot remove yourself or the last admin.');
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={(e) => void invite(e)} className="space-y-3 border border-gold/25 bg-surface p-5">
        <label htmlFor="inv" className="label">Invite another admin by email</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input id="inv" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="input" />
          <button type="submit" className="btn-primary shrink-0">Invite</button>
        </div>
        <p className="text-sm text-ink/60">They must sign in with this exact email address.</p>
        {msg && <p role="status" className="text-sm text-plum">{msg}</p>}
        {err && <p role="alert" className="err">{err}</p>}
      </form>

      <section>
        <h2 className="mb-3 text-xl text-plum">Current admins</h2>
        {!admins ? <p className="text-ink/70">Loading…</p> : (
          <ul className="divide-y divide-gold/15 border border-gold/25">
            {admins.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 p-4">
                <span>{a.email || 'Admin'} {a.isYou && <span className="ml-2 text-xs text-gold">(you)</span>}</span>
                {!a.isYou && <button type="button" aria-label={`Remove ${a.email}`} onClick={() => void removeAdmin(a.id)} className="p-2 text-red-400"><Trash2 className="h-5 w-5" /></button>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl text-plum">Waiting to accept</h2>
        {invites.length === 0 ? <p className="text-ink/70">No pending invitations.</p> : (
          <ul className="divide-y divide-gold/15 border border-gold/25">
            {invites.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 p-4">
                <span>{i.email}</span>
                <button type="button" aria-label={`Cancel invitation for ${i.email}`} onClick={() => void removeInvite(i.id)} className="p-2 text-red-400"><Trash2 className="h-5 w-5" /></button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
