import Layout from '@/components/Layout';
import Head from 'next/head';

const TermsOfService = () => {
  return (
    <Layout>
      <Head>
        <title>Terms of Service - Vet Sidekick</title>
        <meta name="description" content="Read the Vet Sidekick terms of service." />
      </Head>
      <div className="container-wide py-12">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p>This is the Terms of Service page. You can add your terms of service content here.</p>
      </div>
    </Layout>
  );
};

export default TermsOfService; 