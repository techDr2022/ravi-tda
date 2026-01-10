import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, MapPin, Tag, ArrowRight, Globe, Search } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { BLOG_POSTS, getAllRegions, BLOG_CATEGORIES } from '@/lib/blog-data';
import { SITE_CONFIG } from '@/lib/constants';

/**
 * Blog Page SEO Metadata
 * Optimised for healthcare blog and content marketing keywords
 * Title: 55-60 characters, Description: 150-160 characters (British English)
 */
export const metadata: Metadata = {
  title: 'Healthcare Appointment Booking Blog, Clinic Management Tips',
  description: 'Expert insights on healthcare appointment scheduling, clinic management, and digital transformation. Learn best practices from providers worldwide.',
  keywords: [
    'healthcare appointment booking blog',
    'clinic management tips',
    'appointment booking best practices',
    'medical scheduling insights',
    'healthcare technology trends',
    'clinic software guides',
    'doctor appointment system tips',
  ],
  openGraph: {
    title: 'Healthcare Appointment Booking Blog, Clinic Management Tips',
    description: 'Expert insights on healthcare appointment scheduling, clinic management, and digital transformation. Learn best practices from providers worldwide.',
    type: 'website',
    url: `${SITE_CONFIG.url}/blog`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Healthcare Appointment Booking Blog, Clinic Management Tips',
    description: 'Expert insights on healthcare appointment scheduling and clinic management best practices.',
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/blog`,
  },
};

// Blog Card Component
function BlogCard({ post, featured = false }: { post: typeof BLOG_POSTS[0]; featured?: boolean }) {
  return (
    <article 
      className={`group bg-white rounded-2xl border border-healthcare-border overflow-hidden transition-all duration-300 hover:shadow-healthcare-lg hover:-translate-y-1 ${
        featured ? 'md:col-span-2 md:grid md:grid-cols-2' : ''
      }`}
    >
      {/* Image */}
      <div className={`relative overflow-hidden bg-gradient-to-br from-primary-100 to-accent-100 ${
        featured ? 'h-64 md:h-full' : 'h-48'
      }`}>
        {post.image ? (
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Globe className={`text-primary-300 ${featured ? 'w-32 h-32' : 'w-20 h-20'}`} />
          </div>
        )}
        {/* Region Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-primary-700">
            <MapPin className="w-3 h-3" />
            {post.region}
          </span>
        </div>
        {/* Category Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-600/90 backdrop-blur-sm rounded-full text-xs font-medium text-white">
            {post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-healthcare-muted mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(post.publishedAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {post.readTime}
          </span>
        </div>

        {/* Title */}
        <h2 className={`font-bold text-healthcare-text group-hover:text-primary-600 transition-colors mb-3 line-clamp-2 ${
          featured ? 'text-xl md:text-2xl' : 'text-lg'
        }`}>
          <Link href={`/blog/${post.slug}`}>
            {post.title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p className={`text-healthcare-muted mb-4 line-clamp-3 ${
          featured ? 'text-base' : 'text-sm'
        }`}>
          {post.excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>

        {/* Read More */}
        <Link 
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors group/link"
        >
          Read Article
          <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

// Region Filter Pill
function RegionPill({ region, count }: { region: string; count: number }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-healthcare-border rounded-full text-sm font-medium text-healthcare-text hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer">
      <MapPin className="w-4 h-4 text-primary-500" />
      {region}
      <span className="text-xs text-healthcare-muted">({count})</span>
    </span>
  );
}

export default function BlogPage() {
  const regions = getAllRegions();
  const featuredPost = BLOG_POSTS[9]; // Global best practices as featured
  const otherPosts = BLOG_POSTS.filter(post => post.id !== featuredPost.id);

  return (
    <>
      {/* Blog Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'TDAppointments Healthcare Blog',
            description: 'Expert insights on healthcare appointment scheduling and clinic management.',
            url: `${SITE_CONFIG.url}/blog`,
            publisher: {
              '@type': 'Organization',
              name: 'TDAppointments',
              logo: {
                '@type': 'ImageObject',
                url: `${SITE_CONFIG.url}/logo.png`,
              },
            },
            blogPost: BLOG_POSTS.map(post => ({
              '@type': 'BlogPosting',
              headline: post.title,
              description: post.excerpt,
              datePublished: post.publishedAt,
              author: {
                '@type': 'Person',
                name: post.author.name,
              },
              url: `${SITE_CONFIG.url}/blog/${post.slug}`,
            })),
          }),
        }}
      />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary-50/50 to-white relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-30" />
        <Container size="xl" className="relative">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-semibold text-primary-600 shadow-sm border border-primary-100 mb-6">
              <Globe className="w-4 h-4" />
              Global Healthcare Insights
            </span>
            <h1 className="heading-xl text-healthcare-text mb-6">
              Healthcare Appointment
              <span className="text-gradient block">Booking Blog</span>
            </h1>
            <p className="body-lg max-w-2xl mx-auto">
              Expert insights, best practices, and regional guides for healthcare providers worldwide. 
              From small clinics to multi-specialty hospitals – learn how to optimize your patient booking experience.
            </p>
          </div>
        </Container>
      </section>

      {/* Region Pills */}
      <section className="py-8 border-b border-healthcare-border bg-white sticky top-16 z-30">
        <Container size="xl">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-sm font-medium text-healthcare-muted whitespace-nowrap">Filter by Region:</span>
            {regions.map((region) => (
              <RegionPill 
                key={region} 
                region={region} 
                count={BLOG_POSTS.filter(p => p.region === region).length}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* Featured Post */}
      <section className="py-12 bg-slate-50">
        <Container size="xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full" />
            <h2 className="text-xl font-bold text-healthcare-text">Featured Article</h2>
          </div>
          <BlogCard post={featuredPost} featured />
        </Container>
      </section>

      {/* All Posts Grid */}
      <section className="py-16 bg-white">
        <Container size="xl">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full" />
              <h2 className="text-xl font-bold text-healthcare-text">All Articles</h2>
              <span className="text-sm text-healthcare-muted">({BLOG_POSTS.length} posts)</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </Container>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <Container size="xl">
          <div className="text-center mb-12">
            <h2 className="heading-md text-healthcare-text mb-4">Browse by Category</h2>
            <p className="text-healthcare-muted">Explore articles organized by topic</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BLOG_CATEGORIES.map((category) => {
              const count = BLOG_POSTS.filter(p => p.category === category).length;
              return (
                <div 
                  key={category}
                  className="bg-white p-6 rounded-xl border border-healthcare-border hover:border-primary-300 hover:shadow-healthcare transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-healthcare-text group-hover:text-primary-600 transition-colors">
                        {category}
                      </h3>
                      <p className="text-sm text-healthcare-muted mt-1">{count} articles</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-healthcare-muted group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-white">
        <Container size="lg">
          <div className="prose prose-lg max-w-none">
            <h2 className="heading-md text-healthcare-text text-center mb-8">
              Healthcare Appointment Booking Resources for Every Region
            </h2>
            <div className="grid md:grid-cols-2 gap-8 text-sm text-healthcare-muted">
              <div>
                <h3 className="text-lg font-semibold text-healthcare-text mb-3">Americas</h3>
                <p>
                  Whether you're running a clinic in the United States, managing healthcare bookings in Canada, 
                  or serving patients across Latin America including Brazil, Mexico, and Argentina, our guides 
                  help you navigate regional requirements from HIPAA compliance to provincial healthcare systems.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-healthcare-text mb-3">Europe & UK</h3>
                <p>
                  From NHS-integrated systems in the United Kingdom to GDPR-compliant solutions across Germany, 
                  France, and Spain, discover how European healthcare providers are modernizing appointment 
                  management while meeting strict regulatory requirements.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-healthcare-text mb-3">Middle East & Asia</h3>
                <p>
                  Explore healthcare technology transformations in the UAE, Saudi Arabia, Singapore, and India. 
                  Learn about regional insurance integrations, cultural considerations, and the unique 
                  requirements of serving diverse patient populations.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-healthcare-text mb-3">Africa & Oceania</h3>
                <p>
                  From mobile-first healthcare solutions in Nigeria, Kenya, and South Africa to Medicare-integrated 
                  systems in Australia, our insights cover the full spectrum of healthcare booking challenges 
                  and opportunities across developing and developed markets.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700">
        <Container size="lg">
          <div className="text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Stay Updated on Healthcare Technology
            </h2>
            <p className="text-primary-100 mb-8 max-w-xl mx-auto">
              Get the latest insights on healthcare appointment booking, clinic management, 
              and digital transformation delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-healthcare-text placeholder:text-healthcare-muted focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
