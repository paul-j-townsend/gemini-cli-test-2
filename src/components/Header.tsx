
import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4">
      <nav className="container mx-auto flex justify-between">
        <Link href="/" className="text-xl font-bold">
          My Awesome Website
        </Link>
        <div>
          <Link href="/" className="mr-4">
            Home
          </Link>
          <Link href="/podcasts" className="mr-4">
            Podcasts
          </Link>
          <Link href="/about">
            About
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
