import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';

const About = () => {
  const teamMembers = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Founder & Chief Veterinarian',
      bio: 'With over 15 years of experience in companion animal medicine, Dr. Johnson is passionate about veterinary education.',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
      expertise: ['Small Animal Medicine', 'Veterinary Education', 'Practice Management'],
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Content Director',
      bio: 'Emergency veterinarian and educator focused on bridging the gap between research and clinical practice.',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
      expertise: ['Emergency Medicine', 'Critical Care', 'Clinical Research'],
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Educational Coordinator',
      bio: 'Specializing in veterinary pedagogy and continuing professional development programs.',
      image: 'https://images.unsplash.com/photo-1594824388853-c6dd8c72c397?w=300&h=300&fit=crop&crop=face',
      expertise: ['Veterinary Education', 'CPD Programs', 'Online Learning'],
    },
  ];

  const values = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'Innovation',
      description: 'Pioneering new approaches to veterinary education and professional development.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: 'Evidence-Based',
      description: 'All content is grounded in current research and best practices in veterinary medicine.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Community',
      description: 'Building a global network of veterinary professionals committed to excellence.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Accessibility',
      description: 'Making high-quality veterinary education accessible to professionals worldwide.',
    },
  ];

  const stats = [
    { number: '50,000+', label: 'Professionals Reached' },
    { number: '100+', label: 'Expert Episodes' },
    { number: '95%', label: 'Satisfaction Rate' },
    { number: '40+', label: 'Countries Served' },
  ];

  return (
    <Layout>
      <Head>
        <title>About - Vet Sidekick</title>
        <meta name="description" content="Learn about our mission to advance veterinary education and support professional development worldwide." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary-50 via-white to-neutral-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-80 h-80 bg-primary-200/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-secondary-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative container-wide">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Advancing <span className="text-gradient-primary">Veterinary</span> Education
            </h1>

            <p className="text-xl lg:text-2xl text-neutral-600 max-w-4xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              We're dedicated to providing veterinary professionals with expert insights, 
              evidence-based education, and innovative resources that elevate the standard of animal care worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-up">
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-neutral-600 leading-relaxed mb-6">
                At Vet Sidekick, we believe that exceptional veterinary care begins with exceptional education. 
                Our mission is to bridge the gap between cutting-edge research and practical clinical application, 
                making advanced veterinary knowledge accessible to professionals at every stage of their career.
              </p>
              <p className="text-lg text-neutral-600 leading-relaxed mb-8">
                Through our comprehensive podcast series, educational resources, and professional community, 
                we're building a global network of veterinary professionals committed to lifelong learning 
                and excellence in animal care.
              </p>
              <Link href="/podcasts" className="btn-primary">
                Explore Our Content
              </Link>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="relative">
                <div className="card p-8">
                  <div className="grid grid-cols-2 gap-6">
                    {stats.map((stat, index) => (
                      <div key={index} className="text-center animate-scale-in" style={{ animationDelay: `${index * 150}ms` }}>
                        <div className="text-3xl font-bold text-gradient-primary mb-2">{stat.number}</div>
                        <div className="text-sm text-neutral-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-neutral-50 to-primary-50">
        <div className="container-wide">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              These principles guide everything we do and inform how we serve the veterinary community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="card text-center p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-soft">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container-wide">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-6">
              Meet Our Expert Team
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Our team combines decades of clinical experience with a passion for veterinary education and innovation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="card-hover text-center group animate-fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="relative mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover shadow-medium group-hover:shadow-hard transition-all duration-300"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium mb-4">{member.role}</p>
                <p className="text-neutral-600 leading-relaxed mb-6">{member.bio}</p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-neutral-900">Areas of Expertise:</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.expertise.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-3 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="container-wide text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Join Our Mission
            </h2>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto mb-10">
              We're looking for passionate veterinary professionals to contribute to our platform. 
              If you're an expert in your field, we invite you to collaborate with us.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="#" className="btn-secondary btn-lg bg-white text-primary-600 hover:bg-neutral-50">
                Become a Contributor
              </Link>
              <Link href="#" className="btn-ghost btn-lg text-white border-white hover:bg-white/10">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
