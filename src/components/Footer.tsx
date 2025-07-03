import Link from 'next/link';
import HeartIcon from './HeartIcon';
import TwitterIcon from './TwitterIcon';
import LinkedInIcon from './LinkedInIcon';
import YouTubeIcon from './YouTubeIcon';
import FooterLinkList from './FooterLinkList';

import { footerLinks } from '../config/footer';

const Footer = () => {
  const currentYear = new Date().getFullYear();

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
                  <HeartIcon />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gradient-primary">Vet Sidekick</h3>
                  <p className="text-xs text-neutral-400">Professional CPD</p>
                </div>
              </div>
              <p className="text-neutral-300 leading-relaxed mb-6">
                Empowering veterinary professionals with expert insights, educational podcasts and community-driven resources.
              </p>
              <div className="flex space-x-4">
                {/* Social media icons */}
                <a 
                  href={footerLinks.connect[0].href} 
                  className="w-10 h-10 bg-neutral-800 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                  aria-label="Follow us on X"
                >
                  <TwitterIcon />
                </a>
                <a 
                  href={footerLinks.connect[1].href} 
                  className="w-10 h-10 bg-neutral-800 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                  aria-label="Connect on LinkedIn"
                >
                  <LinkedInIcon />
                </a>
                <a 
                  href={footerLinks.connect[2].href} 
                  className="w-10 h-10 bg-neutral-800 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                  aria-label="Subscribe on YouTube"
                >
                  <YouTubeIcon />
                </a>
              </div>
            </div>

            {/* Platform Links */}
            <FooterLinkList title="Platform" links={footerLinks.platform} />

            {/* Resources Links */}
            <FooterLinkList title="Resources" links={footerLinks.resources} />

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
                href="/privacy-policy" 
                className="text-sm text-neutral-400 hover:text-primary-400 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms-of-service" 
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
