import { listEnquiries } from '@/lib/repo';
import { fmtDate } from '@/lib/format';
import { Empty, Notice } from '@/components/ui';
import { enquiryDoneAction } from '@/app/actions';
import { emailHref, phoneHref } from '@/lib/site-contact';
import { requirePermission } from '@/lib/session-user';

export default async function EnquiriesPage({ searchParams }: { searchParams: { status?: string; notice?: string; error?: string } }) {
  await requirePermission('enquiries');
  const status = searchParams.status || 'new';
  const rows = await listEnquiries(status);
  return (
    <>
      <h1>Enquiries</h1>
      <Notice notice={searchParams.notice} error={searchParams.error} />
      <div className="row-actions" style={{ marginBottom: 14 }}>
        {['new', 'done', 'all'].map((s) => (
          <a key={s} className={`chip ${s === status ? 'on' : ''}`} href={`/admin/enquiries?status=${s}`}>{s}</a>
        ))}
      </div>
      {rows.length === 0 ? <Empty text="No enquiries here." /> : (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Contact</th><th>Project</th><th>Services / budget</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id}>
                  <td><strong>{e.name}</strong><br /><a href={phoneHref(e.mobile)}>{e.mobile}</a>{e.email && <><br /><a href={emailHref(e.email, `Your enquiry with Padmaarc`, `Hi ${e.name},\n\nThank you for reaching out to Padmaarc. We are following up on your enquiry.\n\n`)}>{e.email}</a></>}</td>
                  <td>{e.business || '—'}<br /><span className="muted">{e.message || 'No brief added'}</span></td>
                  <td>{e.services?.join(', ') || '—'}<br /><span className="muted">{e.budget || ''}</span></td>
                  <td>{fmtDate(e.createdAt)}</td>
                  <td>
                    {e.status === 'new' ? (
                      <form action={enquiryDoneAction}>
                        <input type="hidden" name="id" value={e.id} />
                        <button className="btn btn-outline btn-sm" type="submit">Mark done</button>
                      </form>
                    ) : <span className="pill">Done</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
