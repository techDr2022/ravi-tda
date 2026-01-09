'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Star, MapPin } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

/**
 * Doctor data interface
 */
interface Doctor {
  id: number;
  name: string;
  specialty: string;
  clinic: string;
  location: string;
  image: string;
  testimonial: string;
  rating: number;
}

// Your actual doctors data
const DOCTORS: Doctor[] = [
  {
    id: 1,
    name: 'Dr. Aman Chandra',
    specialty: 'Urologist',
    clinic: 'Urology Care Center',
    location: 'Hyderabad',
    image: '/doctors/Dr Aman Chandra - Urologist.jpg',
    testimonial: 'TDAppointments has streamlined our patient management. The booking system is intuitive and our patients love the WhatsApp reminders!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Dr. Avani Reddy',
    specialty: 'Gynecologist',
    clinic: 'Women\'s Health Clinic',
    location: 'Hyderabad',
    image: '/doctors/DR avani reddy - Gynecologist.jpg',
    testimonial: 'Managing appointments for my busy practice has never been easier. The Google Book Now feature brings in new patients every week.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Dr. Divya',
    specialty: 'Dermatologist',
    clinic: 'Divya Skin Clinic',
    location: 'Hyderabad',
    image: '/doctors/DR divya  - Dermatologist.jpg',
    testimonial: 'The teleconsultation feature is perfect for follow-up appointments. My patients appreciate the convenience of video consultations.',
    rating: 5,
  },
  {
    id: 4,
    name: 'Dr. Kiran Jogu',
    specialty: 'Gastroenterologist',
    clinic: 'Kiran Gastro Clinic',
    location: 'Hyderabad',
    image: '/doctors/Dr Kiran jogu - Gastroenterologist.jpg',
    testimonial: 'The analytics dashboard gives me insights into my practice that I never had before. Highly recommended for any specialist clinic!',
    rating: 5,
  },
  {
    id: 5,
    name: 'Dr. M. Raga Sirisha',
    specialty: 'Gynecologist',
    clinic: 'Raga\'s Clinic',
    location: 'Hyderabad',
    image: '/doctors/Dr M Raga Sirisha - Gynecologist.jpg',
    testimonial: 'From booking to follow-up, TDAppointments handles everything. Our no-show rate dropped by 60% after implementing their system.',
    rating: 5,
  },
  {
    id: 6,
    name: 'Dr. Madhuri',
    specialty: 'Dermatologist',
    clinic: 'AB Skin Clinic',
    location: 'Hyderabad',
    image: '/doctors/Dr Madhuri - Dermatologist.jpg',
    testimonial: 'The automated review reminders have helped us get over 100 Google reviews. Our online presence has improved significantly!',
    rating: 5,
  },
  {
    id: 7,
    name: 'Dr. Prithvi Perum',
    specialty: 'Gynecologist',
    clinic: 'Mathruthva womens clinic',
    location: 'Hyderabad',
    image: '/doctors/Dr Prithvi perum - Gynecologist.jpg',
    testimonial: 'Managing multiple doctors and their schedules was challenging. TDAppointments made it effortless with their intuitive dashboard.',
    rating: 5,
  },
  {
    id: 8,
    name: 'Dr. SK Gupta',
    specialty: 'Hematologist',
    clinic: 'Blood Care Clinic',
    location: 'Hyderabad',
    image: '/doctors/Dr Sk Gupta - Hematologist.jpg',
    testimonial: 'The patient management system keeps all records organized. I can access patient history instantly during consultations.',
    rating: 5,
  },
  {
    id: 9,
    name: 'Dr. Sourabh Reddy',
    specialty: 'Urologist',
    clinic: 'Orene Uro Clinic',
    location: 'Hyderabad',
    image: '/doctors/Dr Sourabh Reddy - Urologist.jpg',
    testimonial: 'Razorpay integration for teleconsultation payments is seamless. Patients can pay online and we get instant notifications.',
    rating: 5,
  },
  {
    id: 10,
    name: 'Dr. Sravya Buggana',
    specialty: 'Gynecologist',
    clinic: 'IVY Fertility Clinic',
    location: 'Hyderabad',
    image: '/doctors/Dr Sravya Buggana - Gynecologist.jpg',
    testimonial: 'The WhatsApp automation is a game-changer. Appointment confirmations and reminders go out automatically!',
    rating: 5,
  },
  {
    id: 11,
    name: 'Dr. Swathi Sreerangam',
    specialty: 'Gynecologist',
    clinic: 'Samanwi Clinic',
    location: 'Hyderabad',
    image: '/doctors/Dr Swathi Sreerangam - Gynecologist.jpg',
    testimonial: 'We went live in just 24 hours. The onboarding was smooth and the support team was incredibly helpful.',
    rating: 5,
  },
  {
    id: 12,
    name: 'Dr. Aldi Bhavana',
    specialty: 'General Physician',
    clinic: 'Kiran Gastro Clinic',
    location: 'Hyderabad',
    image: '/doctors/Dr. ALDI BHAVANA.jpg',
    testimonial: 'TDAppointments transformed how we manage patient bookings. The staff saves hours every week on administrative tasks.',
    rating: 5,
  },
  {
    id: 13,
    name: 'Dr. T. Rajashekar Reddy',
    specialty: 'Pediatrician',
    clinic: 'Ragas Clinic',
    location: 'Hyderabad',
    image: '/doctors/Dr. T Rajashekar Reddy - Pediatrics.jpg',
    testimonial: 'Parents can now book appointments for their kids anytime through Google. The system is parent-friendly and efficient!',
    rating: 5,
  },
  {
    id: 14,
    name: 'Dr. Srikanth',
    specialty: 'Urologist',
    clinic: 'UNO Clinics',
    location: 'Hyderabad',
    image: '/doctors/Srikanth - Urologist.jpg',
    testimonial: 'The monthly analytics reports help me understand patient trends and optimize my practice. Excellent platform!',
    rating: 5,
  },
];

/**
 * Clients/Doctors Slider Section
 * Showcases doctors who use the platform with testimonials
 */
export function ClientsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Number of cards visible at once (responsive)
  const getVisibleCards = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }
    return 3;
  };

  const [visibleCards, setVisibleCards] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      setVisibleCards(getVisibleCards());
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying]);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % DOCTORS.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + DOCTORS.length) % DOCTORS.length);
  }, []);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Get visible doctors based on current index
  const getVisibleDoctors = () => {
    const doctors = [];
    for (let i = 0; i < visibleCards; i++) {
      const index = (currentIndex + i) % DOCTORS.length;
      doctors.push({ ...DOCTORS[index], displayIndex: i });
    }
    return doctors;
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <section className="section-padding bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-dots opacity-20" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-accent-100 rounded-full blur-3xl opacity-40" />

      <Container size="xl" className="relative z-10">
        <AnimatedSection className="text-center mb-10">
          <span className="inline-block text-xs font-semibold text-primary-600 uppercase tracking-wider mb-2">
            Trusted by Healthcare Professionals
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-healthcare-text mb-3">
            Doctors Who Trust TDAppointments
          </h2>
          <p className="text-sm text-healthcare-muted max-w-2xl mx-auto">
            Join 1200+ healthcare professionals across India who have transformed 
            their practice with our appointment management system.
          </p>
        </AnimatedSection>

        {/* Slider Container */}
        <div 
          className="relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-6 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-healthcare-text hover:bg-primary-50 hover:text-primary-600 transition-all border border-healthcare-border"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-6 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-healthcare-text hover:bg-primary-50 hover:text-primary-600 transition-all border border-healthcare-border"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Cards Container */}
          <div className="overflow-hidden px-4">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className={`grid gap-6 ${
                visibleCards === 3 ? 'lg:grid-cols-3' : 
                visibleCards === 2 ? 'md:grid-cols-2' : 
                'grid-cols-1'
              }`}
            >
              {getVisibleDoctors().map((doctor, idx) => (
                <motion.div
                  key={`${doctor.id}-${currentIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border border-healthcare-border group"
                >
                  {/* Doctor Image */}
                  <div className="relative h-48 bg-gradient-to-br from-primary-50 to-accent-50 overflow-hidden">
                    <img 
                      src={doctor.image} 
                      alt={doctor.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-semibold text-healthcare-text">{doctor.rating}.0</span>
                    </div>

                    {/* Specialty Badge */}
                    <div className="absolute bottom-3 left-3 bg-primary-600/90 backdrop-blur-sm px-2 py-1 rounded-full">
                      <span className="text-[10px] font-semibold text-white">{doctor.specialty}</span>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="p-4">
                    {/* Name & Location */}
                    <div className="mb-3">
                      <h3 className="text-base font-bold text-healthcare-text mb-0.5">
                        {doctor.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-healthcare-muted">
                        <MapPin className="w-2.5 h-2.5" />
                        <span>{doctor.clinic}, {doctor.location}</span>
                      </div>
                    </div>

                    {/* Testimonial */}
                    <div className="relative">
                      <Quote className="absolute -top-1 -left-1 w-5 h-5 text-primary-100" />
                      <p className="text-xs text-healthcare-muted leading-relaxed pl-4 italic line-clamp-3">
                        "{doctor.testimonial}"
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Dots Navigation */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {DOCTORS.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-primary-600'
                    : 'bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <AnimatedSection delay={0.3} className="mt-12">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-5 md:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-white">
              {[
                { value: '1200+', label: 'Happy Doctors' },
                { value: '50K+', label: 'Appointments Booked' },
                { value: '4.9★', label: 'Average Rating' },
                { value: '15+', label: 'Cities Covered' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-xl md:text-2xl font-bold mb-0.5">{stat.value}</div>
                  <div className="text-primary-200 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}

export default ClientsSlider;
