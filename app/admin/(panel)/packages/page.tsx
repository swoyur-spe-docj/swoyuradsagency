import { listPackages } from '@/lib/repo';
import { deletePackageAction } from '@/app/actions';
import { PackageForm } from '@/components/PackageForm';
import { Notice } from '@/components/ui';
import { requirePermission } from '@/lib/session-user';

export default async function PackagesAdmin({ searchParams }: { searchParams: { notice?: string; error?: string } }) {
  await requirePermission('packages');
  const pkgs = await listPackages(true);
  return (
    <>
      <h1>Packages</h1>
      <p className="muted">A price change applies only to new orders. Existing orders keep their own price.</p>
      <Notice notice={searchParams.notice} error={searchParams.error} />
      {pkgs.map((p) => (
        <section className="card" key={p.id}>
          <h3>{p.name} {!p.active && <span className="pill">Hidden</span>}</h3>
          <PackageForm p={p} />
          <form action={deletePackageAction} style={{ marginTop: 10 }}>
            <input type="hidden" name="id" value={p.id} />
            <button className="btn btn-danger btn-sm" type="submit">Delete</button>
          </form>
        </section>
      ))}
      <section className="card">
        <h2>Add package</h2>
        <PackageForm />
      </section>
    </>
  );
}
