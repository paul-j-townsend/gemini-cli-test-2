import Layout from '@/components/Layout';
import Head from 'next/head';

const Cookies = () => {
  return (
    <Layout>
      <Head>
        <title>Cookies Policy</title>
        <meta name="description" content="Learn about how Vet Sidekick uses cookies on our website." />
      </Head>
      <div className="container-wide py-12">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h1 className="text-4xl font-bold mb-8 text-emerald-900">How We Use Cookies</h1>
          
          <p className="text-lg text-emerald-700 mb-6">
            Like most websites, we use small files called cookies to help improve your experience. These cookies are saved on your device when you visit our site – either by us or by trusted third parties whose features we use.
          </p>

          <p className="mb-8">
            Don't worry – we <strong>don't</strong> use cookies to collect any personal or sensitive information about you and we never pass any identifiable data to third parties.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-emerald-900">The Types of Cookies We Use</h2>
            
            <div className="mb-8 p-6 bg-teal-50 rounded-lg border border-teal-200">
              <h3 className="text-xl font-semibold mb-4 text-emerald-900">Strictly Necessary Cookies</h3>
              <p className="mb-4">
                These cookies are needed to make the website work properly and let you do things like:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Sign in to your account</li>
                <li>Post comments</li>
                <li>Save your preferences</li>
              </ul>
              <p className="mb-2"><strong>Examples:</strong> <span className="font-mono text-sm bg-white p-1 rounded border">.Telligent.Evolution</span>, <span className="font-mono text-sm bg-white p-1 rounded border">.CSRoles</span>, <span className="font-mono text-sm bg-white p-1 rounded border">AuthorizationCookie</span></p>
              <p className="mb-0"><strong>Can you opt out?</strong> Not really – without these, the site wouldn't work!</p>
            </div>

            <div className="mb-8 p-6 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-xl font-semibold mb-4 text-emerald-900">Statistics Cookies</h3>
              <p className="mb-4">
                These help us understand how people use the site, so we can improve it over time. For example, they tell us:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Which pages are popular</li>
                <li>How many people are visiting</li>
              </ul>
              <p className="mb-3">
                <strong>We use:</strong> Google Analytics (<span className="font-mono text-sm bg-white p-1 rounded border">_ga</span>, <span className="font-mono text-sm bg-white p-1 rounded border">_gid</span>, <span className="font-mono text-sm bg-white p-1 rounded border">_gat</span>, <span className="font-mono text-sm bg-white p-1 rounded border">collect</span>)
              </p>
              <p className="mb-3 text-sm text-emerald-600">
                We've <em>not</em> enabled any advertising features in Google Analytics.
              </p>
              <p className="mb-0">
                <strong>Want to opt out?</strong> You can install <a href="https://tools.google.com/dlpage/gaoptout" className="text-emerald-600 hover:text-emerald-700 underline" target="_blank" rel="noopener noreferrer">Google's browser add-on</a> to block Google Analytics on any website.
              </p>
            </div>

            <div className="mb-8 p-6 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="text-xl font-semibold mb-4 text-emerald-900">Advertising Cookies</h3>
              <p className="mb-4">
                We use these to anonymously track how well banner ads are performing, such as:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Limiting how often you see the same ad</li>
              </ul>
              <p className="mb-3">
                <strong>Cookie used:</strong> <span className="font-mono text-sm bg-white p-1 rounded border">SSPIDER</span> from ads.workingcommunities.net
              </p>
              <p className="mb-0">
                <strong>Opt-out:</strong> These are used for basic performance info and can't be disabled individually.
              </p>
            </div>

            <div className="mb-8 p-6 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="text-xl font-semibold mb-4 text-emerald-900">Sharing Cookies</h3>
              <p className="mb-4">
                These make it easier for you to share our content on social media like Facebook, X and LinkedIn.
              </p>
              <p className="mb-3">
                <strong>We use:</strong> AddThis (sets cookies like <span className="font-mono text-sm bg-white p-1 rounded border">_atuvc</span>, <span className="font-mono text-sm bg-white p-1 rounded border">_atuvs</span>, <span className="font-mono text-sm bg-white p-1 rounded border">uid</span>, <span className="font-mono text-sm bg-white p-1 rounded border">vc</span> and others)
              </p>
              <p className="mb-0">
                <strong>Want to opt out?</strong> You can do that via the <a href="https://www.oracle.com/legal/privacy/addthis-privacy-policy.html" className="text-emerald-600 hover:text-emerald-700 underline" target="_blank" rel="noopener noreferrer">AddThis privacy settings</a>.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-900">Keeping Things Updated</h2>
            <p>
              We review our cookie policy regularly. The last update was made on <strong>15 March 2018</strong>.
            </p>
          </section>

          <div className="border-t border-emerald-200 pt-8 mt-12">
            <h3 className="text-xl font-semibold mb-4 text-emerald-900">Got Questions?</h3>
            <p className="mb-3">
              If you have any questions about how we use cookies or anything else about your data, feel free to get in touch:
            </p>
            <p className="flex items-center">
              <span className="mr-2">📧</span>
              <strong>Email us at:</strong> 
              <a href="mailto:admin@vetsidekick.com" className="text-emerald-600 hover:text-emerald-700 ml-2">admin@vetsidekick.com</a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cookies;