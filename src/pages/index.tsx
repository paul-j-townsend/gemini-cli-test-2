import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '@/components/Layout';
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
    <Layout>
      <Head>
        <title>Vet Sidekick - Expert Veterinary Insights & Education</title>
        <meta name="description" content="Empowering veterinary professionals with expert insights, educational podcasts and community-driven resources." />
      </Head>

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
    </Layout>
  );
};

export default Home;