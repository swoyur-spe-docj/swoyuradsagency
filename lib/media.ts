export type MediaAsset = { id: string; label: string; kind: 'image' | 'video'; url: string; alt: string; posterUrl?: string; custom?: boolean };

const photo = (id: string, width = 1200, quality = 80) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=${quality}`;

export const MEDIA_DEFAULTS: MediaAsset[] = [
  { id: 'brand_logo', label: 'Brand — full logo', kind: 'image', url: '/padmaarc-logo.png', alt: 'Padmaarc lotus logo' },
  { id: 'home_video', label: 'Home — hero background video', kind: 'video', url: 'https://videos.pexels.com/video-files/6563891/6563891-hd_1920_1080_25fps.mp4', alt: 'Creative team collaborating in a modern office' },
  { id: 'home_video_poster', label: 'Home — video poster image', kind: 'image', url: photo('photo-1521737711867-e3b97375f902', 1200, 85), alt: 'Creative team at work' },
  { id: 'home_feature_video', label: 'Home — studio feature video', kind: 'video', url: 'https://videos.pexels.com/video-files/31512124/13433942_3840_2160_24fps.mp4', alt: 'Behind the scenes of a professional video production' },
  { id: 'home_feature_poster', label: 'Home — studio video poster', kind: 'image', url: photo('photo-1497366216548-37526070297c', 1200, 82), alt: 'Bright creative studio workspace' },
  { id: 'home_service_video', label: 'Home service — video production (MP4)', kind: 'video', url: 'https://videos.pexels.com/video-files/19217931/19217931-uhd_3840_2160_30fps.mp4', alt: 'Camera operator filming indoors' },
  { id: 'home_service_video_poster', label: 'Home service — video production poster', kind: 'image', url: photo('photo-1536240478700-b869070f9279', 720, 78), alt: 'Video production and camera work' },
  { id: 'home_service_design', label: 'Home service — graphic design (MP4)', kind: 'video', url: 'https://videos.pexels.com/video-files/7204567/7204567-uhd_3840_2160_24fps.mp4', alt: 'Graphic designer working on a laptop' },
  { id: 'home_service_design_poster', label: 'Home service — graphic design poster', kind: 'image', url: photo('photo-1545235617-9465d2a55698', 720, 78), alt: 'Creative design workspace' },
  { id: 'home_service_creator', label: 'Home service — creators (MP4)', kind: 'video', url: 'https://videos.pexels.com/video-files/5475285/5475285-hd_1920_1080_30fps.mp4', alt: 'Graphic designers collaborating on a project' },
  { id: 'home_service_creator_poster', label: 'Home service — creators poster', kind: 'image', url: photo('photo-1529139574466-a303027c1d8b', 720, 78), alt: 'Fashion and creator campaign' },
  { id: 'home_service_ads', label: 'Home service — digital ads (MP4)', kind: 'video', url: 'https://videos.pexels.com/video-files/5081440/5081440-uhd_4096_2160_25fps.mp4', alt: 'Graphic designer editing content on a laptop' },
  { id: 'home_service_ads_poster', label: 'Home service — digital ads poster', kind: 'image', url: photo('photo-1460925895917-afdab827c52f', 720, 78), alt: 'Digital marketing analytics' },
  { id: 'home_process_video', label: 'Home — process video (MP4)', kind: 'video', url: 'https://videos.pexels.com/video-files/8089126/8089126-uhd_4096_2160_25fps.mp4', alt: 'Film crew preparing on set' },
  { id: 'home_process_poster', label: 'Home — process video poster', kind: 'image', url: photo('photo-1542038784456-1ea8e935640e', 1200, 82), alt: 'Production camera in a studio' },
  { id: 'home_studio', label: 'Home — studio feature', kind: 'image', url: photo('photo-1497366216548-37526070297c', 1200, 82), alt: 'Bright creative studio workspace' },
  { id: 'about_main', label: 'About — main image', kind: 'image', url: photo('photo-1524758631624-e2822e304c36', 1200, 82), alt: 'Bright, collaborative studio workspace' },
  { id: 'about_strategy', label: 'About — strategy card', kind: 'image', url: photo('photo-1521737711867-e3b97375f902', 720, 78), alt: 'Team discussing business goals' },
  { id: 'about_creative', label: 'About — creative card', kind: 'image', url: photo('photo-1542744173-8e7e53415bb0', 720, 78), alt: 'Creative team shaping a campaign' },
  { id: 'about_delivery', label: 'About — delivery card', kind: 'image', url: photo('photo-1552664730-d307ca884978', 720, 78), alt: 'Team collaborating on campaign delivery' },
  { id: 'contact_main', label: 'Contact — header image', kind: 'image', url: photo('photo-1524758631624-e2822e304c36', 1200, 82), alt: 'Welcoming creative studio workspace' },
  { id: 'packages_main', label: 'Packages — header image', kind: 'image', url: photo('photo-1454165804606-c3d57bc86b40', 1400, 82), alt: 'Marketing team planning business goals' },
  { id: 'portfolio_main', label: 'Portfolio — header image', kind: 'image', url: photo('photo-1545235617-9465d2a55698', 1400, 82), alt: 'Creative campaign work in progress' },
  { id: 'blog_main', label: 'Journal — header image', kind: 'image', url: photo('photo-1455390582262-044c42a312e4', 1400, 82), alt: 'Notes and ideas at a creative desk' },
  { id: 'careers_main', label: 'Careers — header image', kind: 'image', url: photo('photo-1521737711867-e3b97375f902', 1400, 82), alt: 'Collaborative creative team' },
  ...[
    ['services_brand', 'Services — brand strategy', 'photo-1552664730-d307ca884978', 'Brand strategy discussion'],
    ['services_digital', 'Services — digital marketing', 'photo-1460925895917-afdab827c52f', 'Digital marketing dashboard'],
    ['services_ads', 'Services — performance ads', 'photo-1551288049-bebda4e38f71', 'Advertising performance analytics'],
    ['services_social', 'Services — social media', 'photo-1611162616305-c69b3fa7fbe0', 'Social media campaign planning'],
    ['services_video', 'Services — video production', 'photo-1536240478700-b869070f9279', 'Video production'],
    ['services_photo', 'Services — photography', 'photo-1542038784456-1ea8e935640e', 'Brand photography'],
    ['services_web', 'Services — web design', 'photo-1516321318423-f06f85e504b3', 'Website design on a laptop'],
    ['services_content', 'Services — content writing', 'photo-1455390582262-044c42a312e4', 'Writing campaign content'],
  ].map(([id, label, image, alt]) => ({ id, label, kind: 'image' as const, url: photo(image, 640, 76), alt })),
];

export function mediaUrl(items: MediaAsset[], id: string): string {
  return items.find((item) => item.id === id)?.url || MEDIA_DEFAULTS.find((item) => item.id === id)?.url || '';
}
