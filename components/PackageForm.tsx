import { savePackageAction } from '@/app/actions';
import { PackageMediaPicker } from '@/components/PackageMediaPicker';
import type { Pkg } from '@/lib/types';

export function PackageForm({ p }: { p?: Pkg }) {
  return (
    <form action={savePackageAction} className="grid-form">
      {p && <input type="hidden" name="id" value={p.id} />}
      <label>Name<input name="name" defaultValue={p?.name} required /></label>
      <label>Slug (URL name)<input name="slug" defaultValue={p?.slug} required /></label>
      <label>Duration (months)<input name="durationMonths" type="number" min={1} defaultValue={p?.durationMonths ?? 1} required /></label>
      <label>Price (₹)<input name="price" type="number" min={1} defaultValue={p?.price} required /></label>
      <label>Videos<input name="videos" type="number" min={0} defaultValue={p?.videos ?? 0} /></label>
      <label>Posters<input name="posters" type="number" min={0} defaultValue={p?.posters ?? 0} /></label>
      <label>Sort order<input name="sortOrder" type="number" defaultValue={p?.sortOrder ?? 0} /></label>
      <label className="wide">Deliverables (one per line)
        <textarea name="deliverables" rows={4} defaultValue={p?.deliverables.join('\n')} />
      </label>
      <PackageMediaPicker coverUrl={p?.coverUrl} coverVideoUrl={p?.coverVideoUrl} />
      <label className="check"><input type="checkbox" name="active" defaultChecked={p ? p.active : true} /> Show on website</label>
      <label className="check"><input type="checkbox" name="featured" defaultChecked={p?.featured} /> Recommended (only one)</label>
      <div><button className="btn btn-primary btn-sm" type="submit">{p ? 'Save' : 'Add package'}</button></div>
    </form>
  );
}
