import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import LogoSvg from './LogoSvg';

import { navigationItems } from '../config/navigation';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="glass sticky top-0 z-50">
      <nav className="container-wide">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0 focus:outline-none focus:ring-0"
          >
            <div className="relative">
              <div className="w-14 h-14 bg-primary-500 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300 transform group-hover:scale-110">
                <LogoSvg />
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
            {navigationItems.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 ${
                    isActive 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-neutral-700 hover:text-primary-600 focus:text-primary-600 active:text-primary-600 hover:bg-primary-50 focus:bg-primary-50 active:bg-primary-50'
                  } font-medium transition-all duration-200 rounded-lg group`}
                  
                >
                  {item.label}
                  <span className={`absolute bottom-0 left-1/2 h-0.5 bg-gradient-primary transition-all duration-300 transform -translate-x-1/2 ${
                    isActive ? 'w-8' : 'w-0 group-hover:w-8'
                  }`}></span>
                </Link>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/podcasts" className="btn-secondary btn-sm whitespace-nowrap">
              Listen Now
            </Link>
            <Link href="/about" className="btn-primary btn-sm whitespace-nowrap">
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
          <div className="py-4 space-y-2">
            {navigationItems.map((item, index) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 ${
                    isActive 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-neutral-700 hover:text-primary-600 hover:bg-primary-50'
                  } rounded-lg font-medium transition-all duration-200 animate-slide-in-left focus:outline-none focus:ring-0`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {item.label}
                </Link>
              );
            })}
            
            {/* Mobile CTA Buttons */}
            <div className="pt-4 space-y-3">
              <Link
                href="/podcasts"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center btn-secondary btn-sm w-full whitespace-nowrap animate-slide-in-left !focus:ring-0 !focus:ring-offset-0"
                style={{ animationDelay: '300ms' }}
              >
                Listen Now
              </Link>
              <Link
                href="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center btn-primary btn-sm w-full whitespace-nowrap animate-slide-in-left !focus:ring-0 !focus:ring-offset-0"
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
