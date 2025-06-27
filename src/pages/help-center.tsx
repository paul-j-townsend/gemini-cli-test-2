import Layout from '@/components/Layout';
import Head from 'next/head';

const HelpCenter = () => {
  return (
    <Layout>
      <Head>
        <title>Help Center - Vet Sidekick</title>
        <meta name="description" content="Find answers to frequently asked questions about Vet Sidekick." />
      </Head>
      <div className="container-wide py-12">
        <h1 className="text-4xl font-bold mb-8">Help Center</h1>
        <p>This is the Help Center page. You can add frequently asked questions and other helpful information here.</p>
      </div>
    </Layout>
  );
};

export default HelpCenter; 