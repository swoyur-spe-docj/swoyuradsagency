import { listPortfolio } from '@/lib/repo';
import { deletePortfolioAction, movePortfolioAction } from '@/app/actions';
import { PortfolioForm } from '@/components/PortfolioForm';
import { Notice } from '@/components/ui';
import { requirePermission } from '@/lib/session-user';

export default async function PortfolioAdmin({ searchParams }: { searchParams: { notice?: string; error?: string } }) {
  await requirePermission('portfolio');
  const items = await listPortfolio();
  return (
    <>
      <h1>Portfolio</h1>
      <Notice notice={searchParams.notice} error={searchParams.error} />
      {items.map((i) => (
        <section className="card" key={i.id}>
          <h3>{i.title} <span className="pill">{i.category}</span> {!i.published && <span className="pill">Hidden</span>}</h3>
          <PortfolioForm item={i} />
          <div className="row-actions" style={{ marginTop: 10 }}>
            <form action={movePortfolioAction}>
              <input type="hidden" name="id" value={i.id} />
              <input type="hidden" name="dir" value="up" />
              <button className="btn btn-outline btn-sm" type="submit">Move up</button>
            </form>
            <form action={movePortfolioAction}>
              <input type="hidden" name="id" value={i.id} />
              <input type="hidden" name="dir" value="down" />
              <button className="btn btn-outline btn-sm" type="submit">Move down</button>
            </form>
            <form action={deletePortfolioAction}>
              <input type="hidden" name="id" value={i.id} />
              <button className="btn btn-danger btn-sm" type="submit">Delete</button>
            </form>
          </div>
        </section>
      ))}
      <section className="card">
        <h2>Add portfolio item</h2>
        <PortfolioForm />
      </section>
    </>
  );
}
