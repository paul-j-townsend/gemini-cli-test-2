import Head from 'next/head';

const About = () => {
  return (
    <div>
      <Head>
        <title>About - My Awesome Website</title>
        <meta name="description" content="Learn more about our mission and team" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-gradient-to-br from-vet-peach to-vet-cream min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-vet-teal mb-6">
                About Us
              </h1>
              <p className="text-xl text-vet-orange leading-relaxed">
                Dedicated to advancing veterinary care through education and innovation
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-vet-teal">
              <h2 className="text-2xl font-semibold text-vet-teal mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We are committed to providing valuable insights and resources for veterinary professionals, 
                pet owners, and anyone passionate about animal healthcare. Through our podcasts and educational 
                content, we aim to bridge the gap between complex veterinary science and practical pet care.
              </p>
              
              <h2 className="text-2xl font-semibold text-vet-orange mb-4">What We Offer</h2>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-vet-teal mr-2">•</span>
                  Expert discussions on the future of companion animal veterinary care
                </li>
                <li className="flex items-start">
                  <span className="text-vet-teal mr-2">•</span>
                  Insights into the evolving world of animal healthcare
                </li>
                <li className="flex items-start">
                  <span className="text-vet-teal mr-2">•</span>
                  Educational resources for veterinary professionals and pet owners
                </li>
                <li className="flex items-start">
                  <span className="text-vet-teal mr-2">•</span>
                  Community-focused content that brings together all stakeholders in animal care
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
