import Head from 'next/head';

const Home = () => {
  return (
    <div>
      <Head>
        <title>Home - My Awesome Website</title>
        <meta name="description" content="Welcome to my awesome website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-gradient-to-br from-vet-cream to-vet-peach min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-vet-teal mb-6">
              Welcome to My Awesome Website!
            </h1>
            <p className="text-xl text-vet-orange max-w-2xl mx-auto leading-relaxed">
              This is the home page. Check out the other pages to see what this
              website has to offer.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-vet-teal">
              <h3 className="text-xl font-semibold text-vet-teal mb-3">Professional Care</h3>
              <p className="text-gray-600">Expert veterinary services with compassionate care for your beloved pets.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-vet-peach">
              <h3 className="text-xl font-semibold text-vet-orange mb-3">Educational Content</h3>
              <p className="text-gray-600">Listen to our podcasts and learn about the latest in animal healthcare.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-vet-orange">
              <h3 className="text-xl font-semibold text-vet-teal mb-3">Community Focus</h3>
              <p className="text-gray-600">Building stronger relationships between pets, owners, and veterinary professionals.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
