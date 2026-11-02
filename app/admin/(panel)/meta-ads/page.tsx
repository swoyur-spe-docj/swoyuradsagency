import { listClients, listMeta } from '@/lib/repo';
import { addMetaAction } from '@/app/actions';
import { inr, today } from '@/lib/format';
import { Empty, Notice, Stat } from '@/components/ui';
import { requirePermission } from '@/lib/session-user';

export default async function MetaAdsPage({
  searchParams,
}: {
  searchParams: { month?: string; notice?: string; error?: string };
}) {
  await requirePermission('meta');
  const month = searchParams.month || today().slice(0, 7);
  const [data, clients] = await Promise.all([listMeta(month), listClients()]);
  return (
    <>
      <h1>Meta Ads log</h1>
      <p className="muted">Ads run in Meta Ads Manager. This page keeps a record for client reports. Live Meta data is not connected in v1.</p>
      <Notice notice={searchParams.notice} error={searchParams.error} />

      <form method="GET" className="inline" style={{ marginBottom: 14 }}>
        <label>Month<input type="month" name="month" defaultValue={month} /></label>
        <div><button className="btn btn-outline btn-sm" type="submit">Show</button></div>
      </form>

      <div className="stats">
        <Stat label="Budget" value={inr(data.budget)} />
        <Stat label="Spend" value={inr(data.spend)} />
        <Stat label="Leads" value={data.leads} />
      </div>

      <section className="card">
        <h2>Add entry</h2>
        {clients.length === 0 ? <Empty text="Add a client first (clients appear after an order is activated)." /> : (
          <form action={addMetaAction} className="grid-form">
            <label>Client
              <select name="clientId" required>
                <option value="">Select client</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label>Campaign name<input name="campaign" required /></label>
            <label>Start date<input name="startDate" type="date" /></label>
            <label>End date<input name="endDate" type="date" /></label>
            <label>Budget (₹)<input name="budget" type="number" min={0} defaultValue={0} /></label>
            <label>Spend (₹)<input name="spend" type="number" min={0} defaultValue={0} /></label>
            <label>Leads<input name="leads" type="number" min={0} defaultValue={0} /></label>
            <label className="wide">Notes<input name="notes" /></label>
            <div><button className="btn btn-primary btn-sm" type="submit">Add entry</button></div>
          </form>
        )}
      </section>

      <section className="card table-wrap">
        <h2>Entries</h2>
        {data.rows.length === 0 ? <Empty text="No entries for this month." /> : (
          <table>
            <thead><tr><th>Client</th><th>Campaign</th><th>Dates</th><th className="r">Budget</th><th className="r">Spend</th><th className="r">Leads</th></tr></thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.clientName}</td>
                  <td>{r.campaign}</td>
                  <td>{r.startDate || '-'} {r.endDate ? `to ${r.endDate}` : ''}</td>
                  <td className="r">{inr(r.budget)}</td>
                  <td className="r">{inr(r.spend)}</td>
                  <td className="r">{r.leads}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
