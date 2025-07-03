import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '@/components/Layout';

const Home = () => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      title: 'Expert Podcasts',
      description: 'Access cutting-edge veterinary insights from industry leaders and specialists.',
      gradient: 'from-red-500 to-red-600',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: 'Educational Resources',
      description: 'Comprehensive learning materials to enhance your veterinary practice.',
      gradient: 'from-orange-500 to-orange-600',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Professional Community',
      description: 'Connect with veterinary professionals and share knowledge worldwide.',
      gradient: 'from-yellow-500 to-yellow-600',
    },
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Mitchell',
      role: 'Senior Veterinarian',
      content: 'Vet Sidekick has transformed how I stay updated with the latest veterinary practices. The podcast content is exceptional.',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=64&h=64&fit=crop&crop=face',
    },
    {
      name: 'Dr. James Cooper',
      role: 'Emergency Veterinarian',
      content: 'The educational quality and expert insights have significantly improved my clinical decision-making.',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=64&h=64&fit=crop&crop=face',
    },
    {
      name: 'Dr. Emily Chen',
      role: 'Veterinary Resident',
      content: 'As a resident, these resources are invaluable for my continuing education and professional development.',
      avatar: 'https://placehold.co/64',
    },
  ];

  return (
    <Layout>
      <Head>
        <title>Vet Sidekick - Expert Veterinary Insights & Education</title>
        <meta name="description" content="Empowering veterinary professionals with expert insights, educational podcasts and community-driven resources." />
      </Head>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-200/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
          
          {/* Geometric Flourishes */}
          <div className="absolute top-20 left-10 w-32 h-32 border border-red-200/30 rounded-3xl rotate-12 animate-pulse-soft"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-br from-orange-200/20 to-red-200/20 rounded-2xl rotate-45 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 border-2 border-yellow-300/40 rounded-full animate-bounce-soft"></div>
          
          {/* Dotted Pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-red-400 rounded-full animate-pulse-soft"></div>
            <div className="absolute top-3/4 left-1/4 w-1 h-1 bg-orange-400 rounded-full animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-1/3 left-2/3 w-1 h-1 bg-red-500 rounded-full animate-pulse-soft" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>

        <div className="relative container-wide">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-8 animate-fade-in" style={{ animationDelay: '200ms', willChange: 'opacity' }}>
              Elevate Your{' '}
              <span className="text-gradient-to-r from-red-600 to-orange-600">Veterinary</span>{' '}
              Practice
        </h1>

            <p className="text-xl lg:text-2xl text-neutral-600 max-w-4xl mx-auto leading-relaxed mb-12 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              Join thousands of veterinary professionals who trust Vet Sidekick for expert insights, 
              continuing education and the latest advances in companion animal care.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <Link href="/podcasts" className="relative group btn-red btn-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="relative z-10 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <span>Start Listening</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link href="/about" className="relative group btn-orange btn-lg hover:scale-105 transition-all duration-300">
                <span className="relative z-10">Learn More</span>
                <div className="absolute inset-0 border-2 border-red-200 rounded-xl scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300"></div>
              </Link>
            </div>

            {/* Trust Indicators */}
            <ul className="flex flex-wrap items-center justify-center gap-8 mt-16 opacity-60 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
              <li className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium">4.9/5 Rating</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">CPD Approved</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Weekly Updates</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 lg:py-32 bg-white overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 right-10 w-40 h-40 border border-neutral-100 rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-32 h-32 border border-red-100 rounded-2xl rotate-45"></div>
          <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-br from-yellow-50 to-red-50 rounded-full"></div>
        </div>

        <div className="relative container-wide">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
              Why Veterinary Professionals Choose Us
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Discover the features that make Vet Sidekick the preferred choice for continuing education 
              and professional development in veterinary medicine.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="relative card-hover p-8 text-center group animate-fade-in-up overflow-hidden"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Card Background Flourishes */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-neutral-50 to-red-50 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border border-red-100 rounded-2xl rotate-12 -translate-x-8 translate-y-8 opacity-60"></div>
                
                <div className={`relative w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-white mx-auto mb-6 group-hover:scale-110 transition-all duration-500 shadow-soft group-hover:shadow-glow`}>
                  {feature.icon}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white/30 rounded-full animate-pulse-soft"></div>
                </div>
                
                <h3 className="text-2xl font-semibold text-neutral-900 mb-4 group-hover:text-red-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Hover Accent Line */}
                <div className="absolute bottom-0 left-1/2 w-0 h-1 bg-gradient-to-r from-red-400 to-red-600 transition-all duration-500 group-hover:w-20 transform -translate-x-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-neutral-50 to-red-50 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-red-200/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-orange-200/15 rounded-full blur-2xl"></div>
          <div className="absolute top-1/3 right-10 w-32 h-32 border border-red-200/30 rounded-3xl rotate-12"></div>
          <div className="absolute bottom-1/4 left-10 w-24 h-24 bg-gradient-to-br from-yellow-200/20 to-red-200/20 rounded-2xl rotate-45"></div>
        </div>

        <div className="relative container-wide">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
              Trusted by Veterinary Professionals
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              See what veterinary professionals are saying about their experience with Vet Sidekick.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="relative card p-8 animate-fade-in-up group hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Quote Decoration */}
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-80">
                  "
                </div>
                
                {/* Card Accent Corner */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-red-100/50 to-transparent rounded-bl-3xl"></div>
                
                <div className="flex items-center mb-6">
                  <div className="relative">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4 object-cover ring-2 ring-red-200 group-hover:ring-red-400 transition-all duration-300"
                      width={48}
                      height={48}
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 group-hover:text-red-700 transition-colors duration-300">{testimonial.name}</h4>
                    <p className="text-sm text-neutral-500">{testimonial.role}</p>
                  </div>
                </div>
                
                <p className="text-neutral-600 leading-relaxed mb-4">"{testimonial.content}"</p>
                
                <div className="flex text-yellow-400 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                {/* Subtle Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-50/0 to-red-50/0 group-hover:from-red-50/20 group-hover:to-transparent rounded-2xl transition-all duration-500 pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-r from-red-500 to-orange-600 text-white overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-400/20 via-transparent to-orange-700/20"></div>
          <div className="absolute top-10 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-yellow-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 border border-white/20 rounded-3xl rotate-45 animate-pulse-soft"></div>
          
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-white rounded-full animate-pulse-soft"></div>
            <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-white rounded-full animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-1/3 left-2/3 w-3 h-3 bg-white rounded-full animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>

        <div className="relative container-wide text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Advance Your Practice?
            </h2>
            <p className="text-xl text-red-100 max-w-3xl mx-auto mb-10">
              Join thousands of veterinary professionals who are staying ahead with expert insights, 
              continuing education and professional development resources.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/podcasts" className="relative group btn-orange btn-lg bg-white text-red-600 hover:bg-neutral-50 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <span className="relative z-10">Start Learning Today</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white to-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full animate-bounce-soft"></div>
              </Link>
              <Link href="/about" className="relative group btn-ghost btn-lg text-white border-white hover:bg-white/10 hover:scale-105 transition-all duration-300">
                <span className="relative z-10">Learn More About Us</span>
                <div className="absolute inset-0 border-2 border-white/20 rounded-xl scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300"></div>
              </Link>
            </div>
          </div>
    </div>
      </section>
    </Layout>
  );
};

export default Home;
