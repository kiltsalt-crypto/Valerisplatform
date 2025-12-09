import { ArrowLeft } from 'lucide-react';
import { useNavigate } from './LegalWrapper';

export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-slate-400 mb-8">Last Updated: November 25, 2025</p>

          <div className="space-y-6 text-slate-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Valeris ("the Service"), you accept and agree to be bound by the terms
                and provision of this agreement. If you do not agree to abide by these terms, please do not use this Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">2. Description of Service</h2>
              <p>
                Valeris provides a comprehensive trading journal, analytics platform, and educational resources
                for traders. The Service includes various features such as trade tracking, performance analytics, paper
                trading simulation, educational content, and community features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">3. User Accounts</h2>
              <p className="mb-2">When you create an account with us, you must provide accurate and complete information. You are responsible for:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Maintaining the security of your account and password</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">4. Subscription and Billing</h2>
              <p className="mb-2">
                Valeris offers multiple subscription tiers: Free, Pro Trader, Elite Trader, and Mentorship.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Subscriptions are billed on a monthly or annual basis as selected</li>
                <li>You may cancel your subscription at any time</li>
                <li>Cancellation takes effect at the end of the current billing period</li>
                <li>No refunds are provided for partial months or unused services</li>
                <li>We reserve the right to modify subscription pricing with 30 days notice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">5. Free Trial</h2>
              <p>
                New users receive a 7-day free trial period. You may cancel at any time during the trial period without
                charge. After the trial period, your subscription will automatically begin unless cancelled.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">6. Acceptable Use</h2>
              <p className="mb-2">You agree not to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                <li>Attempt to gain unauthorized access to any portion of the Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Share your account credentials with others</li>
                <li>Upload malicious code or viruses</li>
                <li>Scrape, copy, or abuse the Service's data or content</li>
                <li>Impersonate others or provide false information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">7. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are owned by Valeris and are
                protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                You retain ownership of your trading data and journal entries.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">8. User Content</h2>
              <p className="mb-2">
                You retain all rights to the content you submit to the Service (including trades, journal entries, and comments).
                By submitting content, you grant us a license to use, store, and display such content as necessary to provide the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">9. Third-Party Services</h2>
              <p>
                The Service may contain links to third-party websites or services that are not owned or controlled by
                Valeris. We have no control over and assume no responsibility for the content, privacy policies,
                or practices of any third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">10. Disclaimer of Warranties</h2>
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
                IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">11. Limitation of Liability</h2>
              <p>
                IN NO EVENT SHALL VALERIS, ITS DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF THE SERVICE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">12. Data and Privacy</h2>
              <p>
                Your use of the Service is also governed by our Privacy Policy. We take data protection seriously and
                implement appropriate security measures to protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">13. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice,
                for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or
                for any other reason at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">14. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will provide notice of significant changes
                via email or through the Service. Your continued use of the Service after such modifications constitutes
                your acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">15. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which
                Valeris operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">16. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us through the Support page in the application.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
