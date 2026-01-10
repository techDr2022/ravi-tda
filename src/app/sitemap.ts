import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/constants';
import { BLOG_POSTS } from '@/lib/blog-data';

/**
 * Dynamic XML Sitemap Generation
 * Generates sitemap for all public, indexable pages
 * Excludes: /api, /dashboard, /login, /signup, /admin routes
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url;
  const currentDate = new Date();

  // Core marketing pages
  const routes = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ];

  // Blog posts (dynamic routes)
  const blogRoutes = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...routes, ...blogRoutes];
}
