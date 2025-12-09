import { ArrowLeft } from 'lucide-react';
import { useNavigate } from './LegalWrapper';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to App
        </button>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-slate-400 mb-8">Last Updated: November 25, 2025</p>

          <div className="space-y-6 text-slate-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">1. Introduction</h2>
              <p>
                Valeris ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your information when you use our trading journal
                and analytics platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-white mt-4 mb-2">2.1 Personal Information</h3>
              <p className="mb-2">We collect information that you provide directly to us:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Email address and account credentials</li>
                <li>Name and profile information (optional)</li>
                <li>Payment information (processed securely by third-party providers)</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-4 mb-2">2.2 Trading and Usage Data</h3>
              <p className="mb-2">When you use our Service, we collect:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Trade entries, journal notes, and performance data</li>
                <li>Screenshots and attachments you upload</li>
                <li>Usage statistics and feature interactions</li>
                <li>Watchlists, alerts, and preferences</li>
                <li>Community forum posts and comments</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-4 mb-2">2.3 Technical Data</h3>
              <p className="mb-2">We automatically collect certain information:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Access times and referring URLs</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">3. How We Use Your Information</h2>
              <p className="mb-2">We use the collected information for:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Providing and maintaining the Service</li>
                <li>Processing your transactions and managing subscriptions</li>
                <li>Sending you updates, newsletters, and marketing communications (with consent)</li>
                <li>Analyzing usage patterns to improve our Service</li>
                <li>Providing customer support</li>
                <li>Detecting and preventing fraud or abuse</li>
                <li>Complying with legal obligations</li>
                <li>Generating anonymized analytics and insights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">4. Data Sharing and Disclosure</h2>

              <h3 className="text-xl font-semibold text-white mt-4 mb-2">4.1 We Do Not Sell Your Data</h3>
              <p>We do not sell, rent, or trade your personal information to third parties.</p>

              <h3 className="text-xl font-semibold text-white mt-4 mb-2">4.2 Service Providers</h3>
              <p className="mb-2">We may share information with trusted third-party service providers who assist us in:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Cloud hosting and data storage (Supabase)</li>
                <li>Payment processing</li>
                <li>Email delivery</li>
                <li>Analytics and performance monitoring</li>
                <li>Customer support tools</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-4 mb-2">4.3 Legal Requirements</h3>
              <p>We may disclose your information if required by law or to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Comply with legal processes or government requests</li>
                <li>Enforce our Terms of Service</li>
                <li>Protect our rights, privacy, safety, or property</li>
                <li>Prevent fraud or security issues</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-4 mb-2">4.4 Business Transfers</h3>
              <p>
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the
                acquiring entity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">5. Data Security</h2>
              <p className="mb-2">We implement appropriate security measures to protect your information:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication protocols</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and monitoring</li>
                <li>Employee confidentiality agreements</li>
              </ul>
              <p className="mt-2">
                However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">6. Data Retention</h2>
              <p>
                We retain your information for as long as your account is active or as needed to provide services.
                If you close your account, we will delete or anonymize your data within 90 days, except where we are
                required to retain it for legal or regulatory purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">7. Your Rights and Choices</h2>
              <p className="mb-2">You have the following rights regarding your personal data:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Export:</strong> Download your trading data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Cookies:</strong> Manage cookie preferences in your browser</li>
              </ul>
              <p className="mt-2">
                To exercise these rights, contact us through the Support page or your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">8. Cookies and Tracking</h2>
              <p className="mb-2">We use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Remember your preferences and settings</li>
                <li>Authenticate your login sessions</li>
                <li>Analyze usage patterns and improve performance</li>
                <li>Provide personalized content and features</li>
              </ul>
              <p className="mt-2">
                You can control cookies through your browser settings. Note that disabling cookies may affect Service functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">9. Third-Party Links</h2>
              <p>
                Our Service may contain links to third-party websites or services. We are not responsible for the
                privacy practices of these external sites. We encourage you to review their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">10. Children's Privacy</h2>
              <p>
                Our Service is not intended for individuals under 18 years of age. We do not knowingly collect personal
                information from children. If we discover we have collected such information, we will delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">11. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your own. These countries
                may have different data protection laws. By using our Service, you consent to such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">12. GDPR Compliance (EU Users)</h2>
              <p className="mb-2">If you are in the European Economic Area, you have additional rights under GDPR:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to restrict processing</li>
                <li>Right to lodge a complaint with a supervisory authority</li>
              </ul>
              <p className="mt-2">Our legal basis for processing your data includes consent, contract performance, and legitimate interests.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">13. California Privacy Rights (CCPA)</h2>
              <p className="mb-2">California residents have specific rights under the CCPA, including:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Right to know what personal information is collected</li>
                <li>Right to know if personal information is sold or disclosed</li>
                <li>Right to opt-out of the sale of personal information</li>
                <li>Right to deletion of personal information</li>
                <li>Right to non-discrimination for exercising CCPA rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">14. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes via
                email or through a notice on our Service. Your continued use after such changes constitutes acceptance
                of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">15. Contact Us</h2>
              <p>
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us
                through the Support page in the application.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
