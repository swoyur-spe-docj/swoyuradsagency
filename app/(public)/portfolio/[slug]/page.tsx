import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPortfolioBySlug } from '@/lib/repo';
import { SafeImage } from '@/components/SafeImage';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const item = await getPortfolioBySlug(params.slug);
  return { title: item ? `${item.title} · Case study` : 'Case study' };
}

export default async function CaseStudy({ params }: { params: { slug: string } }) {
  const item = await getPortfolioBySlug(params.slug);
  if (!item) notFound();
  const sections = [
    { label: 'The challenge', text: item.challenge },
    { label: 'What we did', text: item.solution },
    { label: 'The result', text: item.result },
  ].filter((section) => section.text);
  return (
    <>
      <section className="page-banner compact container section">
        <div>
          <p className="eyebrow">CASE STUDY · {item.category.toUpperCase()}</p>
          <h1>{item.title}</h1>
          {item.clientName ? <p className="lead">For {item.clientName}</p> : null}
        </div>
      </section>
      <section className="container section case-study">
        {item.thumbUrl ? <div className="case-hero"><SafeImage src={item.thumbUrl} alt={item.title} /></div> : null}
        <div className="case-blocks">
          {sections.map((section, index) => (
            <article className="card case-block" key={section.label} style={{ animationDelay: `${index * 0.08}s` }}>
              <h2>{section.label}</h2>
              <p>{section.text}</p>
            </article>
          ))}
        </div>
        {item.videoUrl ? <p><a className="btn btn-outline" href={item.videoUrl} target="_blank" rel="noreferrer">Watch the video ↗</a></p> : null}
        <div className="card case-cta">
          <h2>Want results like this?</h2>
          <p className="muted">Tell us your goal. We reply personally and suggest the right next step.</p>
          <div className="actions"><Link className="btn btn-primary" href="/contact#enquiry">Start your project</Link><Link className="btn btn-outline" href="/portfolio">Back to all work</Link></div>
        </div>
      </section>
    </>
  );
}
