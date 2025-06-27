import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-vet-teal text-white p-4 shadow-lg">
      <nav className="container mx-auto flex justify-between">
        <Link href="/" className="text-xl font-bold hover:text-vet-cream transition-colors">
          <img src="/images/logo.png" alt="Vet Sidekick Logo" className="h-5 w-5 mr-2" />
          Vet Sidekick
        </Link>
        <div>
          <Link href="/" className="mr-4 hover:text-vet-cream transition-colors">
            Home
          </Link>
          <Link href="/podcasts" className="mr-4 hover:text-vet-cream transition-colors">
            Podcasts
          </Link>
          <Link href="/about" className="hover:text-vet-cream transition-colors">
            About
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
