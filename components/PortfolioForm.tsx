import { savePortfolioAction } from '@/app/actions';
import { CATEGORIES, type PortfolioItem } from '@/lib/types';

export function PortfolioForm({ item }: { item?: PortfolioItem }) {
  return (
    <form action={savePortfolioAction} className="grid-form">
      {item && <input type="hidden" name="id" value={item.id} />}
      <label>Title<input name="title" defaultValue={item?.title} required /></label>
      <label>Category
        <select name="category" defaultValue={item?.category ?? 'Video'}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label>Sort order<input name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} /></label>
      <label>Thumbnail image URL<input name="thumbUrl" type="url" defaultValue={item?.thumbUrl} placeholder="https://..." /></label>
      <label>Video link (optional)<input name="videoUrl" type="url" defaultValue={item?.videoUrl} placeholder="https://..." /></label>
      <fieldset className="case-fields">
        <legend>Case study (optional, shown on its own page)</legend>
        <label>Web address ending<input name="slug" defaultValue={item?.slug} placeholder="e.g. clinic-launch-reels" maxLength={80} /></label>
        <label>Client name<input name="clientName" defaultValue={item?.clientName} maxLength={120} /></label>
        <label>The challenge<textarea name="challenge" rows={3} defaultValue={item?.challenge} maxLength={1500} /></label>
        <label>What we did<textarea name="solution" rows={3} defaultValue={item?.solution} maxLength={1500} /></label>
        <label>The result (use real, verified numbers only)<textarea name="result" rows={2} defaultValue={item?.result} maxLength={1000} /></label>
      </fieldset>
      <label className="check"><input type="checkbox" name="published" defaultChecked={item ? item.published : true} /> Published</label>
      <div><button className="btn btn-primary btn-sm" type="submit">{item ? 'Save' : 'Add item'}</button></div>
    </form>
  );
}
