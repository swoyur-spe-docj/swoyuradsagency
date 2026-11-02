import { listMedia } from '@/lib/repo';
import { Notice } from '@/components/ui';
import { CustomMediaItem, MediaSlot, NewMediaForm } from '@/components/MediaAdmin';
import { requirePermission } from '@/lib/session-user';

export const metadata = { robots: { index: false, follow: false, nocache: true } };

export default async function MediaPage({ searchParams }: { searchParams: { notice?: string; error?: string } }) {
  await requirePermission('media');
  const media = await listMedia();
  const builtIn = media.filter((item) => !item.custom);
  const custom = media.filter((item) => item.custom);
  const homePoster = builtIn.find((item) => item.id === 'home_video_poster')?.url;
  return (
    <>
      <div className="dashboard-welcome">
        <div>
          <p className="eyebrow">SITE CONTENT</p>
          <h1>Media library</h1>
          <p className="muted">Upload new images and videos, replace the ones on the website, or add new items for the portfolio gallery. Changes appear on the site straight away.</p>
        </div>
      </div>
      <Notice notice={searchParams.notice} error={searchParams.error} />

      <section className="card media-add">
        <h2>Add new media</h2>
        <p className="muted">Name it, choose the type, then pick the file. Added items appear in the portfolio gallery.</p>
        <NewMediaForm />
      </section>

      {custom.length > 0 ? (
        <section className="media-section">
          <h2>Your added media</h2>
          <div className="media-grid">{custom.map((item) => <CustomMediaItem key={item.id} item={item} />)}</div>
        </section>
      ) : null}

      <section className="media-section">
        <h2>Website images and videos</h2>
        <p className="muted">Each card is a fixed place on the website. Upload a new file to replace what is shown there.</p>
        <div className="media-grid">
          {builtIn.map((item) => <MediaSlot key={item.id} item={item} poster={item.kind === 'video' ? homePoster : undefined} />)}
        </div>
      </section>
    </>
  );
}
