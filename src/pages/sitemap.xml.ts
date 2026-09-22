import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const siteUrl = 'https://arthurdx.com';
  const currentDate = new Date().toISOString().split('T')[0];

  const pages = [
    { path: '', priority: '1.0', changefreq: 'weekly' },
    { path: 'projects', priority: '0.9', changefreq: 'weekly' },
    { path: 'skills', priority: '0.8', changefreq: 'monthly' },
    { path: 'about', priority: '0.8', changefreq: 'monthly' },
    { path: 'engagements', priority: '0.8', changefreq: 'monthly' },
    { path: 'mentions-legales', priority: '0.3', changefreq: 'yearly' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${siteUrl}/${page.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`.trim();

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};

