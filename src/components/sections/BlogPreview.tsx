'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, MapPin, ArrowRight, Globe, BookOpen } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection';
import { BLOG_POSTS } from '@/lib/blog-data';

/**
 * BlogPreview - Showcases latest blog posts on the homepage
 * SEO-optimized with regional targeting
 */
export function BlogPreview() {
  // Get the 3 most recent posts, excluding medical tourism blogs
  const recentPosts = BLOG_POSTS
    .filter(post => !post.slug.includes('medical-tourism'))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);

  return (
    <section className="section-padding bg-gradient-to-b from-white to-slate-50 relative overflow-hidden" id="blog">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary-50/30 to-transparent" />
      <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-gradient-radial from-accent-50/20 to-transparent" />

      <Container size="xl" className="relative z-10">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-sm font-semibold text-primary-600 mb-4">
            <BookOpen className="w-4 h-4" />
            Healthcare Insights
          </span>
          <h2 className="heading-lg text-healthcare-text mb-4">
            Latest from Our Blog
          </h2>
          <p className="body-md max-w-2xl mx-auto">
            Expert insights on healthcare appointment booking, clinic management, and digital transformation 
            from healthcare providers across the globe.
          </p>
        </AnimatedSection>

        {/* Blog Cards Grid */}
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12" staggerDelay={0.1}>
          {recentPosts.map((post) => (
            <StaggerItem key={post.id}>
              <motion.article
                whileHover={{ y: -8 }}
                className="group bg-white rounded-2xl border border-healthcare-border overflow-hidden shadow-sm hover:shadow-healthcare-lg transition-all h-full flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary-100 via-primary-50 to-accent-100 overflow-hidden">
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Globe className="w-20 h-20 text-primary-300" />
                      </motion.div>
                    </div>
                  )}
                  {/* Region Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-primary-700 shadow-sm">
                      <MapPin className="w-3 h-3" />
                      {post.region}
                    </span>
                  </div>
                  {/* Category Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className="inline-flex items-center px-3 py-1 bg-primary-600/90 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
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
                  <h3 className="text-lg font-bold text-healthcare-text group-hover:text-primary-600 transition-colors mb-3 line-clamp-2 flex-grow-0">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-healthcare-muted mb-4 line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>

                  {/* Read More */}
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors group/link mt-auto"
                  >
                    Read Article
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </motion.article>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* View All CTA */}
        <AnimatedSection delay={0.4} className="text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all group"
          >
            <BookOpen className="w-5 h-5" />
            View All Articles
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </AnimatedSection>

        {/* Regional Coverage Stats */}
        <AnimatedSection delay={0.5} className="mt-16">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 md:p-10 text-white overflow-hidden relative">
            <div className="absolute inset-0 pattern-dots opacity-10" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <h3 className="text-xl md:text-2xl font-bold mb-2">
                  Global Healthcare Expertise
                </h3>
                <p className="text-slate-400">
                  Serving healthcare providers across 6 continents
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-6 text-center">
                {[
                  { region: 'Americas', flag: '🇺🇸', countries: 'USA, Canada, Brazil' },
                  { region: 'Europe', flag: '🇪🇺', countries: 'UK, Germany, France' },
                  { region: 'Middle East', flag: '🇦🇪', countries: 'UAE, Saudi, Qatar' },
                  { region: 'Asia Pacific', flag: '🇸🇬', countries: 'Singapore, India' },
                  { region: 'Africa', flag: '🇿🇦', countries: 'Nigeria, Kenya, SA' },
                  { region: 'Oceania', flag: '🇦🇺', countries: 'Australia, NZ' },
                ].map((item) => (
                  <motion.div 
                    key={item.region}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="text-3xl mb-2">{item.flag}</div>
                    <div className="font-semibold text-sm mb-1">{item.region}</div>
                    <div className="text-xs text-slate-400">{item.countries}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}

export default BlogPreview;
