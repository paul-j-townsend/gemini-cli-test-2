import Layout from '@/components/Layout';
import Head from 'next/head';

const PrivacyPolicy = () => {
  return (
    <Layout>
      <Head>
        <title>Privacy Policy - Vet Sidekick</title>
        <meta name="description" content="Read the Vet Sidekick privacy policy." />
      </Head>
      <div className="container-wide py-12">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p>This is the Privacy Policy page. You can add your privacy policy content here.</p>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy; 