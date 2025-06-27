import Layout from '../components/Layout';
import PodcastPlayer from '@/components/PodcastPlayer';

const Podcasts = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Podcasts
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Explore the latest insights in veterinary care and animal healthcare from industry experts and thought leaders.
          </p>
        </div>

        <div className="mt-8">
          <PodcastPlayer />
        </div>
      </div>
    </Layout>
  );
};

export default Podcasts;
