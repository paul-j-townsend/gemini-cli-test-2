import Layout from '@/components/Layout';
import Head from 'next/head';

const TermsOfService = () => {
  return (
    <Layout>
      <Head>
        <title>Terms and Conditions - Vet Sidekick</title>
        <meta name="description" content="Read the Vet Sidekick terms and conditions." />
      </Head>
      <div className="container-wide py-12">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h1 className="text-4xl font-bold mb-8 text-neutral-900">Vet Sidekick – Terms and Conditions</h1>
          
          <p className="text-lg text-neutral-700 mb-8">
            By using this website, you agree to the terms set out below. If you don't accept these terms, please don't use the site.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-neutral-900">1. Use of the Site</h2>
            <p className="mb-4">
              You can view, download and print content from this site for <strong>personal, non-commercial use only</strong>.
            </p>
            <p className="mb-4">
              You must keep all copyright or legal notices on anything you download. You <strong>must not</strong> share, change, reuse, repost, or use any text, images, videos, or audio from this site for commercial or public use without written permission from Vet Sidekick.
            </p>
            <p>
              Assume everything on this site is copyrighted, unless it clearly says otherwise.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-neutral-900">2. Intellectual Property</h2>
            <p>
              This site may reference trademarks, patents, products, or technologies that belong to Vet Sidekick or others. You are <strong>not</strong> given any rights or licenses to use these.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-neutral-900">3. Accuracy of Information</h2>
            <p className="mb-4">
              We try to keep everything on this site accurate and up to date, but we can't guarantee it. The content is provided <strong>"as is"</strong> without any warranties.
            </p>
            <p className="mb-4">
              We're not liable for any issues caused by using the site or relying on its content.
            </p>
            <p className="mb-4">
              We also don't guarantee that the site will always be available or free from viruses. You use it at your own risk.
            </p>
            <p>
              We may change or remove content or features on the site at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-neutral-900">4. Submissions</h2>
            <p className="mb-4">
              Anything you send us through the site (emails, messages, feedback, etc.) will be treated as <strong>non-confidential and non-proprietary</strong>.
            </p>
            <p>
              We may use anything you submit—ideas, content, suggestions—for any purpose, including developing or marketing products.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-neutral-900">5. Errors and Changes</h2>
            <p>
              The site may include errors or outdated info. We can correct or update anything at any time without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-neutral-900">6. Links to Other Sites</h2>
            <p className="mb-4">
              We are not responsible for any websites linked to from this one. Visiting them is at your own risk.
            </p>
            <p>
              We don't endorse or review the content of those external sites.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-neutral-900">7. User-Generated Content</h2>
            <p className="mb-4">
              We're not responsible for what users post in forums, chats, or comments. We may monitor these spaces, but we're not required to.
            </p>
            <p>
              You must <strong>not</strong> post anything illegal, offensive, or inappropriate. We will fully cooperate with law enforcement if needed.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-neutral-900">8. Changes to These Terms</h2>
            <p>
              We may update these Terms and Conditions at any time. You should check this page regularly to stay up to date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-neutral-900">9. Linking Policy</h2>
            <p className="mb-4">
              You may link to our home page, but <strong>deep linking</strong> (to subpages) needs our written permission.
            </p>
            <p>
              You may not frame our site or embed any part of it on other sites.
            </p>
          </section>

          <div className="border-t border-neutral-200 pt-8 mt-12">
            <h3 className="text-xl font-semibold mb-4 text-neutral-900">Contact</h3>
            <p>
              For any questions, email: <a href="mailto:admin@vetsidekick.com" className="text-primary-600 hover:text-primary-700">admin@vetsidekick.com</a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService; 