import Link from 'next/link';
import { useState } from 'react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { href: '/', label: 'Home' },
    { href: '/podcasts', label: 'Podcasts' },
    { href: '/calculators', label: 'Calculators' },
    { href: '/news', label: 'News' },
    { href: '/forum', label: 'Forum' },
    { href: '/jobs', label: 'Jobs' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header className="glass border-b border-white/10 sticky top-0 z-50 animate-fade-in-down">
      <nav className="container-wide">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0"
          >
            <div className="relative">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300 transform group-hover:scale-110">
                <svg className="w-18 h-18 text-white translate-x-1" fill="currentColor" viewBox="0 0 960 560">
                  <path d="M500.9,442c0,0-16,55.1-12.8,80.1c0,0-36.5-42.3-178.2-89.1S152.8,324.7,152.8,324.7s-42.3-87.8,19.2-146.2c61.5-58.3,157.7-41.7,185.3,7.1c0,0-14.1-101.9,100-128.8C571.4,29.8,591.9,142,589.4,159.9c0,0-41-67.9-119.2-61.5c-78.2,6.4-103.8,71.8-102.6,112.8c0,0-44.9-68.6-135.3-21.2S204.1,342,204.1,342s34.6,56.4,123.7,78.2c89.1,21.8,146.8,69.2,150,76.9C477.8,497.1,482.9,463.1,500.9,442z M413.5,214.1c-22.8,3.4-37.7,29.7-33.4,58.9c4.3,29.2,26.3,50.1,49,46.7c22.8-3.4,37.7-29.7,33.4-58.9C458.2,231.6,436.3,210.7,413.5,214.1z M502.8,249.6c23-0.7,40.9-25.2,40-54.6c-0.9-29.5-20.3-52.8-43.3-52.1c-23,0.7-40.9,25.2-40,54.6C460.5,226.9,479.8,250.3,502.8,249.6z M567.4,202.1c-16.9,24.2-15.2,54.5,3.7,67.6c18.9,13.2,47.9,4.2,64.7-20c16.9-24.2,15.2-54.5-3.7-67.6C613.2,169,584.3,177.9,567.4,202.1z M671.7,288.8c-16.7-15.8-46.7-11.4-67,10c-20.3,21.4-23.2,51.6-6.5,67.4c16.7,15.8,46.7,11.4,67-10S688.4,304.7,671.7,288.8z M574.4,317.3c-0.2-5.1-0.1-9.3,0-12.4c-3.2-20.2-17.8-36.7-37-42.1c-27.2-7.5-48.1,11.6-49.2,12.6c-4.1,4.2-14.5,21-14.5,21c-15.5,27.4-36.9,37.8-52.2,45.1s-30.3,24.5-29.1,42.1c1.2,17.6,16.4,25.2,27.7,30.4c11.3,5.2,34.9,4.8,34.9,4.8c29.6,2.9,79.4,23.9,84.3,26.9c4.9,3,16.2,7,16.2,7c27.5,6.1,42.5-13.6,42.5-13.6s4.8-6.9,5.6-24.4c0.8-17.5-15.5-38.9-22.7-51.2C571.1,347.1,574.6,325.1,574.4,317.3z"/>
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gradient-primary">
                Vet Sidekick
              </h1>
              <p className="text-xs text-neutral-500 -mt-1">Professional CPD</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 text-neutral-700 hover:text-primary-600 font-medium transition-all duration-200 rounded-lg hover:bg-primary-50 group"
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-8 transform -translate-x-1/2"></span>
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/podcasts" className="btn-secondary btn-sm">
              Listen Now
            </Link>
            <Link href="/about" className="btn-primary btn-sm">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Toggle mobile menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center">
              <span 
                className={`block h-0.5 w-6 bg-neutral-600 transition-all duration-300 ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''
                }`}
              />
              <span 
                className={`block h-0.5 w-6 bg-neutral-600 mt-1 transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span 
                className={`block h-0.5 w-6 bg-neutral-600 mt-1 transition-all duration-300 ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden transition-all duration-300 ease-out overflow-hidden ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 space-y-2 border-t border-neutral-200">
            {navigationItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-neutral-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-all duration-200 animate-slide-in-left"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Mobile CTA Buttons */}
            <div className="pt-4 space-y-3 border-t border-neutral-200">
              <Link
                href="/podcasts"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center btn-secondary btn-sm w-full animate-slide-in-left"
                style={{ animationDelay: '300ms' }}
              >
                Listen Now
              </Link>
              <Link
                href="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center btn-primary btn-sm w-full animate-slide-in-left"
                style={{ animationDelay: '400ms' }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
