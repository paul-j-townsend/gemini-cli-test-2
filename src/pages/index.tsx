import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import EmailSubscription from '@/components/EmailSubscription';

const Home = () => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      title: 'Healing Wisdom',
      description: 'Nurturing insights from compassionate veterinary healers who understand the sacred bond between animals and caregivers.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: 'Holistic Learning',
      description: 'Comprehensive educational resources that honor the whole animal and embrace natural healing approaches.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9a9 9 0 01-9-9m9 9c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10z" />
        </svg>
      ),
      title: 'Connected Community',
      description: 'A thriving ecosystem of veterinary souls dedicated to compassionate animal care and mindful practice.',
    },
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Mitchell',
      role: 'Holistic Veterinarian',
      content: 'Vet Sidekick has reconnected me with the deeper purpose of veterinary medicine - healing with heart and soul.',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=64&h=64&fit=crop&crop=face',
    },
    {
      name: 'Dr. James Cooper',
      role: 'Wildlife Rehabilitation Specialist',
      content: 'This platform beautifully bridges traditional veterinary knowledge with the wisdom of natural healing.',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=64&h=64&fit=crop&crop=face',
    },
    {
      name: 'Dr. Emily Chen',
      role: 'Integrative Medicine Resident',
      content: 'As I grow in my practice, these resources nourish both my clinical skills and my spiritual connection to animal care.',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=64&h=64&fit=crop&crop=face',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Vet Sidekick - Expert Veterinary Insights & Education</title>
        <meta name="description" content="Empowering veterinary professionals with expert insights, educational podcasts and community-driven resources." />
      </Head>

      {/* Nature Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border-b border-emerald-200 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-4 group">
              <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">VetSidekick</h1>
                <p className="text-xs text-emerald-600 font-medium">Holistic Healing Wisdom</p>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/podcasts" className="text-emerald-700 hover:text-teal-600 font-medium transition-colors flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" />
                </svg>
                <span>Healing Wisdom</span>
              </Link>
              <Link href="/articles" className="text-emerald-700 hover:text-teal-600 font-medium transition-colors">Natural Resources</Link>
              <Link href="/about" className="text-emerald-700 hover:text-teal-600 font-medium transition-colors">Our Philosophy</Link>
              <Link href="/podcasts" className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-full hover:from-emerald-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg">
                Begin Journey
              </Link>
            </div>
            
            <button className="md:hidden p-2 rounded-lg hover:bg-emerald-100 transition-colors">
              <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      <section className="relative py-24 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-200/30 to-emerald-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-teal-200/30 to-cyan-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-lime-200/20 to-green-200/20 rounded-full blur-2xl"></div>
          
          <div className="absolute top-20 left-10 w-32 h-32 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-300">
              <path d="M20,20 Q50,5 80,20 Q95,50 80,80 Q50,95 20,80 Q5,50 20,20 Z" fill="currentColor" />
            </svg>
          </div>
          <div className="absolute bottom-20 right-20 w-24 h-24 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full text-teal-300">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="50" cy="50" r="15" fill="currentColor" />
            </svg>
          </div>
          <div className="absolute top-1/3 right-1/4 opacity-20">
            <svg className="w-16 h-16 text-green-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" />
            </svg>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-8 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-700 mb-8 leading-tight">
              Nourish Your 
              <br />
              Veterinary Soul
            </h1>
            <p className="text-xl text-emerald-800 mb-12 leading-relaxed max-w-4xl mx-auto">
              Discover the harmony between modern veterinary science and timeless wisdom. 
              Join a community of healers who understand that caring for animals is both an art and a calling.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/podcasts" className="group relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-full hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Begin Your Journey
                </span>
              </Link>
              <Link href="/about" className="px-8 py-4 border-2 border-emerald-600 text-emerald-700 font-semibold rounded-full hover:bg-emerald-50 transition-all duration-300">
                Explore Our Philosophy
              </Link>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-8 border-t border-emerald-200">
              <div className="flex items-center space-x-2 text-emerald-700">
                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" />
                </svg>
                <span className="text-sm font-medium">Mindful Practice</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-700">
                <svg className="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium">Compassionate Care</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-700">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9a9 9 0 01-9-9m9 9c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10z" />
                </svg>
                <span className="text-sm font-medium">Holistic Approach</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-600 mb-6">
              Cultivate Your Healing Practice
            </h2>
            <p className="text-xl text-emerald-800 max-w-3xl mx-auto leading-relaxed">
              Discover resources that nurture both your professional growth and your connection to the healing arts.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="group text-center">
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    {feature.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full opacity-80"></div>
                </div>
                <h3 className="text-2xl font-bold text-emerald-800 mb-6 group-hover:text-teal-700 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-emerald-700 leading-relaxed text-lg">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-emerald-600 mb-6">
              Voices from Our Community
            </h2>
            <p className="text-xl text-teal-800">
              Hear from veterinary healers who have found their path through compassionate practice.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                  <svg className="w-12 h-12 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                
                <div className="flex items-center mb-6">
                  <div className="relative">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full mr-4 object-cover border-4 border-emerald-200 group-hover:border-teal-300 transition-colors duration-300"
                      width={64}
                      height={64}
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-800 text-lg group-hover:text-teal-700 transition-colors duration-300">{testimonial.name}</h4>
                    <p className="text-emerald-600 font-medium">{testimonial.role}</p>
                  </div>
                </div>
                
                <p className="text-emerald-700 leading-relaxed text-lg mb-6">"{testimonial.content}"</p>
                
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/20 via-transparent to-teal-500/20"></div>
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="absolute top-20 left-20 opacity-10">
            <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" />
            </svg>
          </div>
          <div className="absolute bottom-20 right-20 opacity-10">
            <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl lg:text-6xl font-bold mb-8">
            Ready to Embrace 
            <br />
            Holistic Healing?
          </h2>
          <p className="text-2xl text-emerald-100 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join thousands of veterinary souls who are rediscovering the profound joy and sacred responsibility of animal healing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/podcasts" className="px-10 py-5 bg-white text-emerald-700 font-bold text-xl rounded-full hover:bg-emerald-50 transition-colors duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105">
              Start Your Healing Journey
            </Link>
            <Link href="/about" className="px-10 py-5 border-2 border-white text-white font-bold text-xl rounded-full hover:bg-white/10 transition-all duration-300">
              Discover Our Vision
            </Link>
          </div>
        </div>
      </section>

      {/* Nature Footer */}
      <footer className="relative bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 left-1/3 opacity-5">
            <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" />
            </svg>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">VetSidekick</h3>
                  <p className="text-emerald-300 font-medium">Holistic Healing Wisdom</p>
                </div>
              </div>
              <p className="text-emerald-100 mb-6 max-w-md leading-relaxed">
                Nurturing the sacred bond between veterinary healers and the animals in their care through mindful practice, natural wisdom, and compassionate community.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 bg-emerald-600/50 hover:bg-emerald-500 rounded-full flex items-center justify-center transition-all transform hover:scale-110">
                  <svg className="w-6 h-6 text-emerald-100" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
                  </svg>
                </a>
                <a href="#" className="w-12 h-12 bg-emerald-600/50 hover:bg-emerald-500 rounded-full flex items-center justify-center transition-all transform hover:scale-110">
                  <svg className="w-6 h-6 text-emerald-100" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="w-12 h-12 bg-emerald-600/50 hover:bg-emerald-500 rounded-full flex items-center justify-center transition-all transform hover:scale-110">
                  <svg className="w-6 h-6 text-emerald-100" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-emerald-200 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" />
                </svg>
                Healing Paths
              </h4>
              <ul className="space-y-3">
                <li><Link href="/podcasts" className="text-emerald-300 hover:text-emerald-100 transition-colors flex items-center space-x-2">
                  <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                  <span>Wisdom Podcasts</span>
                </Link></li>
                <li><Link href="/articles" className="text-emerald-300 hover:text-emerald-100 transition-colors flex items-center space-x-2">
                  <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                  <span>Natural Resources</span>
                </Link></li>
                <li><Link href="/my-progress" className="text-emerald-300 hover:text-emerald-100 transition-colors flex items-center space-x-2">
                  <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                  <span>Growth Journey</span>
                </Link></li>
                <li><Link href="/about" className="text-emerald-300 hover:text-emerald-100 transition-colors flex items-center space-x-2">
                  <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                  <span>Our Philosophy</span>
                </Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-emerald-200 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Community Care
              </h4>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-emerald-300 hover:text-emerald-100 transition-colors flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  <span>Healing Support</span>
                </Link></li>
                <li><Link href="/contact" className="text-emerald-300 hover:text-emerald-100 transition-colors flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  <span>Connect with Us</span>
                </Link></li>
                <li><Link href="/privacy-policy" className="text-emerald-300 hover:text-emerald-100 transition-colors flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  <span>Privacy Promise</span>
                </Link></li>
                <li><Link href="/terms-of-service" className="text-emerald-300 hover:text-emerald-100 transition-colors flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  <span>Sacred Terms</span>
                </Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-emerald-700/50 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-emerald-200 text-sm flex items-center">
              <svg className="w-4 h-4 mr-2 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              © 2024 VetSidekick. Healing wisdom shared with love.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-sm text-emerald-300 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Mindful Practice
              </span>
              <span className="text-sm text-emerald-300 flex items-center">
                <span className="w-2 h-2 bg-teal-400 rounded-full mr-2"></span>
                Holistic Approach
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;