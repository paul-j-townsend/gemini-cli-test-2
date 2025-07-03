import Layout from '@/components/Layout';
import Head from 'next/head';

const Contact = () => {
  return (
    <Layout>
      <Head>
        <title>Contact Us - Vet Sidekick</title>
        <meta name="description" content="Get in touch with the Vet Sidekick team." />
      </Head>
      <div className="container-wide py-12">
        <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
        <p>admin@vetsidekick.com</p>
      </div>
    </Layout>
  );
};

export default Contact; 