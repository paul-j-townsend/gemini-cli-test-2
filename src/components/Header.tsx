import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import LogoSvg from './LogoSvg';
import { Menu, X, User, ChevronDown, UserCircle, TrendingUp } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { HeaderUserSwitcher } from './HeaderUserSwitcher';

import { navigationItems } from '../config/navigation';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMyStuffOpen, setIsMyStuffOpen] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const myStuffRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (myStuffRef.current && !myStuffRef.current.contains(event.target as Node)) {
        setIsMyStuffOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

              {/* My Stuff Dropdown */}
              {user && (
                <div className="relative" ref={myStuffRef}>
                  <button
                    onClick={() => setIsMyStuffOpen(!isMyStuffOpen)}
                    className={`relative px-4 py-2 ${
                      router.pathname === '/my-profile' || router.pathname === '/my-progress'
                        ? 'text-primary-600 bg-primary-50' 
                        : 'text-neutral-700 hover:text-primary-600 focus:text-primary-600 active:text-primary-600 hover:bg-primary-50 focus:bg-primary-50 active:bg-primary-50'
                    } font-medium transition-all duration-200 rounded-lg group no-focus-border flex items-center space-x-1`}
                    style={{ 
                      outline: 'none', 
                      border: 'none',
                      boxShadow: 'none'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.outline = 'none'}
                    onFocus={(e) => e.currentTarget.style.outline = 'none'}
                  >
                    <span>My Stuff</span>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${isMyStuffOpen ? 'rotate-180' : ''}`} />
                    <span className={`absolute bottom-0 left-1/2 h-0.5 bg-gradient-primary transition-all duration-300 transform -translate-x-1/2 ${
                      (router.pathname === '/my-profile' || router.pathname === '/my-progress') ? 'w-8' : 'w-0 group-hover:w-8'
                    }`}></span>
                  </button>

                  {/* Dropdown Menu */}
                  {isMyStuffOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
                      <Link
                        href="/my-profile"
                        onClick={() => setIsMyStuffOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-neutral-700 hover:text-primary-600 hover:bg-primary-50 transition-colors no-focus-border"
                        style={{ 
                          outline: 'none', 
                          border: 'none',
                          boxShadow: 'none',
                          textDecoration: 'none'
                        }}
                      >
                        <UserCircle size={18} />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href="/my-progress"
                        onClick={() => setIsMyStuffOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-neutral-700 hover:text-primary-600 hover:bg-primary-50 transition-colors no-focus-border"
                        style={{ 
                          outline: 'none', 
                          border: 'none',
                          boxShadow: 'none',
                          textDecoration: 'none'
                        }}
                      >
                        <TrendingUp size={18} />
                        <span>My Progress</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
              
              {/* User Info */}
              {user && (
                <div className="ml-4 flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-primary-50 rounded-lg">
                    <User size={16} className="text-primary-600" />
                    <span className="text-sm font-medium text-primary-700">{user.name}</span>
                  </div>
                  <HeaderUserSwitcher />
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

              {/* My Stuff - Mobile */}
              {user && (
                <div className="px-4 py-3 mt-4 border-t border-neutral-200 space-y-2">
                  <div className="text-sm font-medium text-neutral-500 px-2 mb-3">My Stuff</div>
                  <Link
                    href="/my-profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-neutral-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors no-focus-border"
                    style={{ 
                      outline: 'none', 
                      border: 'none',
                      boxShadow: 'none',
                      textDecoration: 'none'
                    }}
                  >
                    <UserCircle size={18} />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/my-progress"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-neutral-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors no-focus-border"
                    style={{ 
                      outline: 'none', 
                      border: 'none',
                      boxShadow: 'none',
                      textDecoration: 'none'
                    }}
                  >
                    <TrendingUp size={18} />
                    <span>My Progress</span>
                  </Link>
                </div>
              )}

              {/* User Info - Mobile */}
              {user && (
                <div className="px-4 py-3 mt-4 border-t border-neutral-200 space-y-3">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-primary-50 rounded-lg">
                    <User size={16} className="text-primary-600" />
                    <span className="text-sm font-medium text-primary-700">{user.name}</span>
                  </div>
                  <HeaderUserSwitcher />
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
