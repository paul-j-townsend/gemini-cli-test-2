
import Head from 'next/head';

const Home = () => {
  return (
    <div>
      <Head>
        <title>Home - My Awesome Website</title>
        <meta name="description" content="Welcome to my awesome website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="text-4xl font-bold text-center">
          Welcome to My Awesome Website!
        </h1>

        <p className="mt-4 text-center text-lg">
          This is the home page. Check out the other pages to see what this
          website has to offer.
        </p>
      </main>
    </div>
  );
};

export default Home;
