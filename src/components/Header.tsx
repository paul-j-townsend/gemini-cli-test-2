import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import LogoSvg from './LogoSvg';
import { Menu, X, User } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

import { navigationItems } from '../config/navigation';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  return (
    <>
      <style>{`
        .no-focus-border:focus,
        .no-focus-border:active,
        .no-focus-border:focus-visible,
        .no-focus-border:focus-within {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>
      <header className="glass sticky top-0 z-50">
        <nav className="container-wide">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0 no-focus-border"
              style={{ 
                outline: 'none', 
                border: 'none',
                boxShadow: 'none',
                textDecoration: 'none'
              }}
              onMouseDown={(e) => e.currentTarget.style.outline = 'none'}
              onFocus={(e) => e.currentTarget.style.outline = 'none'}
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
                    } font-medium transition-all duration-200 rounded-lg group no-focus-border`}
                    style={{ 
                      outline: 'none', 
                      border: 'none',
                      boxShadow: 'none',
                      textDecoration: 'none'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.outline = 'none'}
                    onFocus={(e) => e.currentTarget.style.outline = 'none'}
                  >
                    {item.label}
                    <span className={`absolute bottom-0 left-1/2 h-0.5 bg-gradient-primary transition-all duration-300 transform -translate-x-1/2 ${
                      isActive ? 'w-8' : 'w-0 group-hover:w-8'
                    }`}></span>
          </Link>
                );
              })}
              
              {/* User Info */}
              {user && (
                <div className="ml-4 flex items-center space-x-2 px-3 py-2 bg-primary-50 rounded-lg">
                  <User size={16} className="text-primary-600" />
                  <span className="text-sm font-medium text-primary-700">{user.name}</span>
                </div>
              )}
            </div>




            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors duration-200 no-focus-border"
              aria-label="Toggle mobile menu"
              style={{ 
                outline: 'none', 
                border: 'none',
                boxShadow: 'none'
              }}
              onMouseDown={(e) => e.currentTarget.style.outline = 'none'}
              onFocus={(e) => e.currentTarget.style.outline = 'none'}
            >
              {isMobileMenuOpen ? (
                <X size={20} className="text-neutral-600" />
              ) : (
                <Menu size={20} className="text-neutral-600" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <div 
            className={`md:hidden transition-all duration-300 ease-out overflow-hidden ${
              isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
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
                    } rounded-lg font-medium transition-all duration-200 animate-slide-in-left no-focus-border`}
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      outline: 'none', 
                      border: 'none',
                      boxShadow: 'none',
                      textDecoration: 'none'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.outline = 'none'}
                    onFocus={(e) => e.currentTarget.style.outline = 'none'}
                  >
                    {item.label}
          </Link>
                );
              })}

              {/* User Info - Mobile */}
              {user && (
                <div className="px-4 py-3 mt-4 border-t border-neutral-200">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-primary-50 rounded-lg">
                    <User size={16} className="text-primary-600" />
                    <span className="text-sm font-medium text-primary-700">{user.name}</span>
                  </div>
                </div>
              )}

            </div>
        </div>
      </nav>
    </header>
    </>
  );
};

export default Header;
