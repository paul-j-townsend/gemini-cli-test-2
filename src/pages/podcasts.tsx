
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

      <main>
        <h1 className="text-4xl font-bold text-center">
          Our Podcasts
        </h1>

        <div className="mt-8">
          <PodcastPlayer />
        </div>
      </main>
    </div>
  );
};

export default Podcasts;
