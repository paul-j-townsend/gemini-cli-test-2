import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { label: 'Home', href: '/' },
      { label: 'Podcasts', href: '/podcasts' },
      { label: 'Calculators', href: '/calculators' },
      { label: 'News', href: '/news' },
      { label: 'Forum', href: '/forum' },
      { label: 'Jobs', href: '/jobs' },
      { label: 'About', href: '/about' },
    ],
    resources: [
      { label: 'Help Center', href: '/help-center' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms-of-service' },
    ],
    connect: [
      { label: 'Twitter', href: '#' },
      { label: 'LinkedIn', href: '#' },
      { label: 'YouTube', href: '#' },
      { label: 'Newsletter', href: '#' },
    ],
  };

  return (
    <footer className="relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent"></div>
      
      <div className="relative container-wide">
        {/* Main footer content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand section */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-soft">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gradient-primary">Vet Sidekick</h3>
                  <p className="text-xs text-neutral-400">Professional CPD</p>
                </div>
              </div>
              <p className="text-neutral-300 leading-relaxed mb-6">
                Empowering veterinary professionals with expert insights, educational podcasts, and community-driven resources.
              </p>
              <div className="flex space-x-4">
                {/* Social media icons */}
                <a 
                  href="#" 
                  className="w-10 h-10 bg-neutral-800 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                  aria-label="Follow us on Twitter"
                >
                  <svg className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-neutral-800 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                  aria-label="Connect on LinkedIn"
                >
                  <svg className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-neutral-800 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                  aria-label="Subscribe on YouTube"
                >
                  <svg className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Platform</h4>
              <ul className="space-y-3">
                {footerLinks.platform.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="text-neutral-300 hover:text-primary-400 transition-colors duration-200 hover:translate-x-1 transform inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Resources</h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="text-neutral-300 hover:text-primary-400 transition-colors duration-200 hover:translate-x-1 transform inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter Signup */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Stay Updated</h4>
              <p className="text-neutral-300 mb-4 text-sm leading-relaxed">
                Get the latest veterinary insights and podcast updates delivered to your inbox.
              </p>
              <div className="space-y-3">
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-l-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                  <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-r-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-900">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-neutral-400">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-800 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <p className="text-sm text-neutral-400">
              © {currentYear} Vet Sidekick. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <Link 
                href="#" 
                className="text-sm text-neutral-400 hover:text-primary-400 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link 
                href="#" 
                className="text-sm text-neutral-400 hover:text-primary-400 transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link 
                href="#" 
                className="text-sm text-neutral-400 hover:text-primary-400 transition-colors duration-200"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
