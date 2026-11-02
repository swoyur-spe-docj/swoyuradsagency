import { listClientRows } from '@/lib/repo';
import { fmtDate, daysUntil } from '@/lib/format';
import { Empty, Notice } from '@/components/ui';
import { quotaAction } from '@/app/actions';
import { requirePermission } from '@/lib/session-user';

export default async function ClientsPage({ searchParams }: { searchParams: { notice?: string; error?: string } }) {
  await requirePermission('clients');
  const rows = await listClientRows();
  return (
    <>
      <h1>Clients</h1>
      <p className="muted">Use the buttons to log delivered videos and posters. Quota stops at the package limit.</p>
      <Notice notice={searchParams.notice} error={searchParams.error} />
      {rows.length === 0 ? <Empty text="No active clients yet. Clients appear here after an order is activated." /> : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr><th>Client</th><th>Package</th><th>Dates</th><th>Videos</th><th>Posters</th><th>Status</th></tr>
            </thead>
            <tbody>
              {rows.map(({ cp, client }) => {
                const left = daysUntil(cp.endDate);
                const videosFull = cp.videosUsed >= cp.videosTotal;
                const postersFull = cp.postersUsed >= cp.postersTotal;
                return (
                  <tr key={cp.id}>
                    <td>{client?.name}<br /><span className="muted">{client?.business} · {client?.city}</span></td>
                    <td>{cp.packageName}</td>
                    <td>{fmtDate(cp.startDate)}<br />to {fmtDate(cp.endDate)}</td>
                    <td>
                      <div>{cp.videosUsed} / {cp.videosTotal}</div>
                      <form action={quotaAction}>
                        <input type="hidden" name="cpId" value={cp.id} />
                        <input type="hidden" name="kind" value="video" />
                        <button className="btn btn-outline btn-sm" type="submit" disabled={videosFull}>{videosFull ? 'Quota full' : '+1 video'}</button>
                      </form>
                    </td>
                    <td>
                      <div>{cp.postersUsed} / {cp.postersTotal}</div>
                      <form action={quotaAction}>
                        <input type="hidden" name="cpId" value={cp.id} />
                        <input type="hidden" name="kind" value="poster" />
                        <button className="btn btn-outline btn-sm" type="submit" disabled={postersFull}>{postersFull ? 'Quota full' : '+1 poster'}</button>
                      </form>
                    </td>
                    <td>
                      {left < 0 ? <span className="pill">Ended</span> : left <= 7 ? <span className="pill pill-new">Ends in {left} days</span> : <span className="pill pill-active">Active</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
