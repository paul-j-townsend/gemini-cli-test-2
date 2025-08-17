import Layout from '@/components/Layout';
import Head from 'next/head';

const PrivacyPolicy = () => {
  return (
    <Layout>
      <Head>
        <title>Privacy Policy</title>
        <meta name="description" content="Read the Vet Sidekick privacy policy." />
      </Head>
      <div className="container-wide py-12">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose max-w-none">
          <p className="text-lg mb-6 italic">Last updated: 3rd July 2025</p>
          
          <p className="mb-6">This Privacy Policy explains how we collect, use and protect your personal information.</p>
          
          <p className="mb-8">By using our site, you agree to how we collect and use your information, as described here. We may update this policy at any time without notice. If we do, we'll post the changes on this page so you always know what data we collect, how we use it and when we might share it.</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Our Commitment to Privacy</h2>
            <p className="mb-4">We only collect personal data—like your name, email, or phone number—when you provide it to us. We'll always explain why we need it and we won't use it for other reasons without your consent. In rare cases, we may process your data without consent if required by law.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">When you register or contact us, we may ask for some personal details. Without this information, we might not be able to provide certain services.</p>
            <p className="mb-4">We may use your data to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Deliver services or products</li>
              <li>Respond to your requests</li>
              <li>Process payments</li>
              <li>Send updates about services you may find useful</li>
              <li>Improve our website</li>
            </ul>
            <p className="mb-4">Any information you send to our support team is used only to help solve your issue and is kept confidential.</p>
            <p className="mb-4">We keep your data only as long as necessary, in line with legal and ethical obligations.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Sharing Your Information</h2>
            <p className="mb-4">We do <strong>not</strong> sell your data. We only share it when needed to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide services through trusted partners (e.g. delivery or tech support)</li>
              <li>Comply with legal obligations or investigations</li>
              <li>Support a transfer of business ownership (your data would remain protected under this policy)</li>
            </ul>
            <p className="mb-4">Any third party we work with must follow strict data protection rules and only use your information as agreed.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Your Rights</h2>
            <p className="mb-4">You can ask us to update, correct, or delete your personal data at any time. You can also request to stop receiving communications.</p>
            <p className="mb-4">To do this, email <strong><a href="mailto:admin@vetsidekick.com">admin@vetsidekick.com</a></strong> with the details of your request. We'll respond promptly and in accordance with UK data protection law.</p>
            <p className="mb-4">Requests to delete data may be subject to legal or ethical record-keeping requirements.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Security</h2>
            <p className="mb-4">We take reasonable steps to protect your data from loss, misuse, or unauthorised access. We use secure networks, password protection and other safeguards. No system is 100% secure, but we work to minimise risks.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
            <p className="mb-4">We collect anonymous data on how people use our site (like pages visited and searches made). This helps us improve the website.</p>
            <p className="mb-4">We may use cookies—small files stored on your device—to collect this information. Cookies do <strong>not</strong> identify you personally and don't harm your computer. You can manage cookies in your browser settings.</p>
            <p className="mb-4">We may also use web tags (invisible tracking tools) in combination with cookies to help us measure the success of our site or adverts. These tools may involve third-party services, but they only collect aggregated, anonymous data.</p>
            <p className="mb-4">To manage third-party tracking or learn more, visit the <a href="https://thenai.org/" className="text-emerald-600 hover:underline">Network Advertising Initiative</a> website.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Links to Other Websites</h2>
            <p className="mb-4">This policy applies only to our websites. If you visit other sites through links we provide, their privacy policies will apply. We aren't responsible for how those sites handle your data.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
            <p className="mb-4">For questions, comments, or concerns about this policy—or to update or remove your data—please email:</p>
            <p className="mb-4"><strong><a href="mailto:admin@vetsidekick.com">admin@vetsidekick.com</a></strong></p>
            <p className="mb-4">We welcome suggestions on how we can improve this policy.</p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy; 