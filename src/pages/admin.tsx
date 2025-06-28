import Head from 'next/head';
import Layout from '@/components/Layout';

const Admin = () => {
  return (
    <Layout>
      <Head>
        <title>Admin Panel - Vet Sidekick</title>
        <meta name="description" content="Admin panel for managing Vet Sidekick content." />
      </Head>
      <div className="container-wide py-12">
        <h1 className="text-4xl font-bold text-neutral-900 mb-8">Admin Panel</h1>
        <p className="text-lg text-neutral-600">
          Welcome to the admin panel. More features will be added here soon.
        </p>
      </div>
    </Layout>
  );
};

export default Admin;
