// Explains each core service as its own editorial section.
// Calls to action connect visitors to the existing package and enquiry flows.
import Link from 'next/link';
import { listMedia } from '@/lib/repo';
import { mediaUrl } from '@/lib/media';
import { ActionIcon } from '@/components/ActionIcon';
import { SafeImage } from '@/components/SafeImage';

const SERVICES = [
  { title: 'Brand strategy', text: 'Build a clear position and a recognisable voice before the campaign begins.', steps: ['Discovery', 'Positioning', 'Creative direction'], image: 'services_brand' },
  { title: 'Digital marketing', text: 'Connect the right channels into a practical plan with consistent messaging.', steps: ['Audience', 'Channel plan', 'Monthly review'], image: 'services_digital' },
  { title: 'Performance ads', text: 'Set up and manage Meta campaigns with a clear objective and creative testing.', steps: ['Campaign setup', 'Creative tests', 'Optimisation'], image: 'services_ads' },
  { title: 'Social media', text: 'Keep your presence active with useful, on-brand posts and campaign content.', steps: ['Content plan', 'Design', 'Publishing support'], image: 'services_social' },
  { title: 'Video production', text: 'Create short-form videos and ad films shaped for social feeds and local audiences.', steps: ['Concept', 'Shoot', 'Edit'], image: 'services_video' },
  { title: 'Photography', text: 'Show your products, people and place with imagery made for your brand.', steps: ['Shot list', 'Capture', 'Retouch'], image: 'services_photo' },
  { title: 'Web and app design', text: 'Make the digital journey easier to understand, trust and act on.', steps: ['Structure', 'Interface', 'Build handoff'], image: 'services_web' },
  { title: 'Content writing', text: 'Turn your offer into clear copy for ads, social posts and campaign pages.', steps: ['Brief', 'Draft', 'Refine'], image: 'services_content' },
];

export default async function ServicesPage() {
  const media = await listMedia();
  return (
    <>
      <section className="section container">
        <p className="eyebrow">WHAT WE DO <span /> CREATIVE × PERFORMANCE</p>
        <h1 className="editorial-heading">One connected team. The right work for your next stage.</h1>
        <p className="lead">Choose a monthly package or tell us what you need. We will help shape the right starting point.</p>
      </section>
      <section className="container section services-list">
        {SERVICES.map((service, index) => (
          <article className="service-detail" id={`service-${index + 1}`} key={service.title}>
            <span className="service-number">{String(index + 1).padStart(2, '0')}</span>
            <SafeImage className="service-detail-image" src={mediaUrl(media, service.image)} alt={`${service.title} service`} loading="lazy" />
            <div><h2>{service.title}</h2><p style={{ marginTop: 10 }}>{service.text}</p><div className="service-process">{service.steps.map((step) => <span key={step}>{step}</span>)}</div></div>
            <div><Link className="service-link" href="/contact"><ActionIcon name="contact" /> Discuss this service <span aria-hidden="true">↗</span></Link></div>
          </article>
        ))}
      </section>
      <section className="section container"><div className="card"><p className="eyebrow">READY WHEN YOU ARE <span /> LET’S TALK</p><h2>Put your next campaign in motion.</h2><div className="actions"><Link className="btn btn-primary" href="/packages"><ActionIcon name="package" /> Compare packages</Link><Link className="btn btn-outline" href="/contact"><ActionIcon name="contact" /> Send an enquiry</Link></div></div></section>
    </>
  );
}
