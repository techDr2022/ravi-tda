import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, MapPin, Tag, ArrowLeft, ArrowRight, Share2, Linkedin, Twitter, Facebook, Globe, User } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { BLOG_POSTS, getRelatedPosts } from '@/lib/blog-data';
import { SITE_CONFIG } from '@/lib/constants';

// Generate static params for all blog posts
export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

// Generate metadata for each blog post
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.seoKeywords,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
      url: `${SITE_CONFIG.url}/blog/${post.slug}`,
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
    alternates: {
      canonical: `${SITE_CONFIG.url}/blog/${post.slug}`,
    },
  };
}

// Related Post Card Component
function RelatedPostCard({ post }: { post: typeof BLOG_POSTS[0] }) {
  return (
    <article className="group bg-white rounded-xl border border-healthcare-border overflow-hidden hover:shadow-healthcare transition-all">
      <div className="relative h-32 bg-gradient-to-br from-primary-100 to-accent-100 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Globe className="w-12 h-12 text-primary-300" />
        </div>
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-primary-700">
            <MapPin className="w-2.5 h-2.5" />
            {post.region}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3 text-xs text-healthcare-muted mb-2">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.readTime}
          </span>
        </div>
        <h3 className="font-semibold text-sm text-healthcare-text group-hover:text-primary-600 transition-colors line-clamp-2">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
      </div>
    </article>
  );
}

// Share Button Component
function ShareButton({ icon: Icon, label, href, color }: { 
  icon: React.ElementType; 
  label: string; 
  href: string; 
  color: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${color}`}
      aria-label={`Share on ${label}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </a>
  );
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post.slug, 3);
  const shareUrl = `${SITE_CONFIG.url}/blog/${post.slug}`;
  const shareText = encodeURIComponent(post.title);

  return (
    <>
      {/* Article Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt,
            image: post.image,
            datePublished: post.publishedAt,
            dateModified: post.publishedAt,
            author: {
              '@type': 'Person',
              name: post.author.name,
              jobTitle: post.author.role,
            },
            publisher: {
              '@type': 'Organization',
              name: 'TDAppointments',
              logo: {
                '@type': 'ImageObject',
                url: `${SITE_CONFIG.url}/logo.png`,
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': shareUrl,
            },
            keywords: post.seoKeywords.join(', '),
            articleSection: post.category,
          }),
        }}
      />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: SITE_CONFIG.url,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: `${SITE_CONFIG.url}/blog`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: post.title,
                item: shareUrl,
              },
            ],
          }),
        }}
      />

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-primary-50/50 to-white relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-30" />
        <Container size="lg" className="relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-healthcare-muted mb-8">
            <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-primary-600 transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-healthcare-text truncate max-w-xs">{post.title}</span>
          </nav>

          {/* Category & Region */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-healthcare-border text-healthcare-text rounded-full text-sm font-medium">
              <MapPin className="w-3.5 h-3.5 text-primary-500" />
              {post.region}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-healthcare-text leading-tight mb-6">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-lg md:text-xl text-healthcare-muted max-w-3xl mb-8">
            {post.excerpt}
          </p>

          {/* Author & Meta */}
          <div className="flex flex-wrap items-center gap-6 pb-8 border-b border-healthcare-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
                {post.author.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-healthcare-text">{post.author.name}</div>
                <div className="text-sm text-healthcare-muted">{post.author.role}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-healthcare-muted">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(post.publishedAt).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* Article Content */}
      <section className="py-12 bg-white">
        <Container size="lg">
          <div className="grid lg:grid-cols-[1fr_300px] gap-12">
            {/* Main Content */}
            <article className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content.trim() }} />
            </article>

            {/* Sidebar */}
            <aside className="space-y-8">
              {/* Share */}
              <div className="bg-slate-50 rounded-xl p-6 sticky top-24">
                <h3 className="font-semibold text-healthcare-text mb-4 flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share This Article
                </h3>
                <div className="flex flex-col gap-2">
                  <ShareButton
                    icon={Twitter}
                    label="Twitter"
                    href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`}
                    color="bg-sky-100 text-sky-700 hover:bg-sky-200"
                  />
                  <ShareButton
                    icon={Linkedin}
                    label="LinkedIn"
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareText}`}
                    color="bg-blue-100 text-blue-700 hover:bg-blue-200"
                  />
                  <ShareButton
                    icon={Facebook}
                    label="Facebook"
                    href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                    color="bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="font-semibold text-healthcare-text mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-white border border-healthcare-border rounded-full text-xs font-medium text-healthcare-muted hover:border-primary-300 hover:text-primary-600 transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* SEO Keywords (visible for SEO) */}
              <div className="text-xs text-healthcare-muted">
                <strong>Related searches:</strong>{' '}
                {post.seoKeywords.join(', ')}
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* Related Posts */}
      <section className="py-16 bg-slate-50">
        <Container size="lg">
          <h2 className="text-2xl font-bold text-healthcare-text mb-8">Related Articles</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <RelatedPostCard key={relatedPost.id} post={relatedPost} />
            ))}
          </div>
        </Container>
      </section>

      {/* Navigation */}
      <section className="py-8 bg-white border-t border-healthcare-border">
        <Container size="lg">
          <div className="flex justify-between items-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-healthcare-muted hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Articles
            </Link>
            <div className="flex items-center gap-4">
              {/* Find previous and next posts */}
              {(() => {
                const currentIndex = BLOG_POSTS.findIndex(p => p.slug === post.slug);
                const prevPost = BLOG_POSTS[currentIndex - 1];
                const nextPost = BLOG_POSTS[currentIndex + 1];
                
                return (
                  <>
                    {prevPost && (
                      <Link
                        href={`/blog/${prevPost.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-healthcare-muted hover:text-primary-600 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                      </Link>
                    )}
                    {nextPost && (
                      <Link
                        href={`/blog/${nextPost.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-healthcare-muted hover:text-primary-600 transition-colors"
                      >
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700">
        <Container size="lg">
          <div className="text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Transform Your Clinic's Appointment Booking?
            </h2>
            <p className="text-primary-100 mb-8 max-w-xl mx-auto">
              Join over 1,200 healthcare providers worldwide using TDAppointments to streamline patient scheduling.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
