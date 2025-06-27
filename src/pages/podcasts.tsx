import Head from 'next/head';
import PodcastPlayer from '@/components/PodcastPlayer';
import Layout from '@/components/Layout';

const Podcasts = () => {
  return (
    <Layout>
      <Head>
        <title>Podcasts - Vet Sidekick</title>
        <meta name="description" content="Expert veterinary insights and educational podcasts for professionals" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-br from-primary-50 via-white to-neutral-50 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative container-wide">
          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-100 to-primary-50 px-4 py-2 rounded-full text-primary-700 text-sm font-medium mb-6 animate-scale-in">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-soft"></div>
              <span>Professional Veterinary Content</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Expert <span className="text-gradient-primary">Veterinary</span> Podcasts
            </h1>
            
            <p className="text-lg lg:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed mb-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              Stay ahead with cutting-edge insights, expert interviews, and practical guidance 
              from leading veterinary professionals. Enhance your practice with evidence-based content.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <div className="flex items-center space-x-2 text-neutral-500">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Expert-Led Content</span>
              </div>
              <div className="flex items-center space-x-2 text-neutral-500">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Updated Weekly</span>
              </div>
              <div className="flex items-center space-x-2 text-neutral-500">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-medium">CPD Accredited</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-primary-500 to-primary-600 animate-fade-in-up">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
              <div className="text-3xl lg:text-4xl font-bold mb-2">50+</div>
              <div className="text-primary-100">Expert Episodes</div>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '400ms' }}>
              <div className="text-3xl lg:text-4xl font-bold mb-2">10K+</div>
              <div className="text-primary-100">Active Listeners</div>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '600ms' }}>
              <div className="text-3xl lg:text-4xl font-bold mb-2">98%</div>
              <div className="text-primary-100">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Podcast Player Section */}
      <section className="py-16 lg:py-24">
        <div className="container-wide">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Latest Episodes
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Dive into our latest discussions on veterinary practice, animal welfare, 
              and the future of companion animal care.
            </p>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <PodcastPlayer />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white animate-fade-in-up">
        <div className="container-wide text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Never Miss an Episode
          </h2>
          <p className="text-lg text-neutral-300 mb-8 max-w-2xl mx-auto">
            Subscribe to get notified when new episodes are released. 
            Join thousands of veterinary professionals staying informed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-6 py-4 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
            <button className="w-full sm:w-auto btn-primary">
              Subscribe
            </button>
          </div>
          <p className="text-sm text-neutral-400 mt-4">
            Free forever. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Podcasts;
