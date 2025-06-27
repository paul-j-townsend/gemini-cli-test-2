
import Head from 'next/head';

const About = () => {
  return (
    <div>
      <Head>
        <title>About - My Awesome Website</title>
        <meta name="description" content="About my awesome website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="text-4xl font-bold text-center">
          About Us
        </h1>

        <p className="mt-4 text-center text-lg">
          This is the about page. Here you can learn more about the purpose of
          this website.
        </p>
      </main>
    </div>
  );
};

export default About;
