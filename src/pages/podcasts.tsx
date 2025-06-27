import Head from 'next/head';
import PodcastPlayer from '@/components/PodcastPlayer';

const Podcasts = () => {
  return (
    <div>
      <Head>
        <title>Podcasts - My Awesome Website</title>
        <meta name="description" content="Listen to our awesome podcasts" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-gradient-to-br from-vet-cream to-white min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-vet-teal mb-4">
              Our Podcasts
            </h1>
            <p className="text-lg text-vet-orange max-w-xl mx-auto">
              Explore the latest insights in veterinary care and animal healthcare
            </p>
          </div>

          <div className="mt-8">
            <PodcastPlayer />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Podcasts;
