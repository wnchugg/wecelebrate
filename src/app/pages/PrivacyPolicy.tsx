import { Shield, Lock, Eye, Download, Trash2 } from 'lucide-react';
import { Link } from 'react-router';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-[#D91C81]" aria-hidden="true" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">Last Updated: February 2, 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to the JALA 2 Event Gifting Platform ("we," "our," or "us"). We are committed 
              to protecting your privacy and personal data in compliance with the General Data Protection 
              Regulation (GDPR), California Consumer Privacy Act (CCPA), and other applicable privacy laws.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Essential Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Email address or employee identifier (for access validation)</li>
                  <li>Language preference</li>
                  <li>Session information (temporary, cleared on logout)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Optional Information (with consent)</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Usage analytics (only if you consent to analytics cookies)</li>
                  <li>Marketing preferences (only if you consent to marketing cookies)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use your personal information for the following purposes:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Access Control:</strong> To verify your eligibility to access the gift selection portal</li>
              <li><strong>Service Delivery:</strong> To provide and maintain our services</li>
              <li><strong>Communication:</strong> To respond to your inquiries and provide support</li>
              <li><strong>Analytics:</strong> To improve our services (only with your consent)</li>
              <li><strong>Security:</strong> To protect against fraud and maintain security</li>
            </ul>
          </section>

          {/* Legal Basis for Processing (GDPR) */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Legal Basis for Processing (GDPR)</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Consent:</strong> For analytics and marketing cookies</li>
              <li><strong>Legitimate Interest:</strong> For necessary cookies and security measures</li>
              <li><strong>Contractual Necessity:</strong> To provide the service you've accessed</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Privacy Rights</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                <Eye className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Right to Access</h3>
                  <p className="text-sm text-gray-700">Request a copy of your personal data</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                <Download className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Right to Portability</h3>
                  <p className="text-sm text-gray-700">Export your data in a machine-readable format</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
                <Trash2 className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Right to Erasure</h3>
                  <p className="text-sm text-gray-700">Request deletion of your personal data</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
                <Lock className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Right to Object</h3>
                  <p className="text-sm text-gray-700">Object to certain processing of your data</p>
                </div>
              </div>
            </div>
            <p className="text-gray-700 mt-4">
              To exercise your rights, visit our{' '}
              <Link to="/privacy-settings" className="text-[#D91C81] hover:underline font-medium">
                Privacy Settings
              </Link>{' '}
              page.
            </p>
          </section>

          {/* California Rights (CCPA) */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">California Privacy Rights (CCPA)</h2>
            <p className="text-gray-700 mb-4">
              If you are a California resident, you have additional rights under the CCPA:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Right to Know:</strong> What personal information we collect and how we use it</li>
              <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
              <li><strong>Right to Opt-Out:</strong> Opt-out of the "sale" of personal information</li>
              <li><strong>Right to Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
            </ul>
            <p className="text-gray-700 mt-4">
              We do not sell personal information. You can manage your "Do Not Sell" preference in{' '}
              <Link to="/privacy-settings" className="text-[#D91C81] hover:underline font-medium">
                Privacy Settings
              </Link>.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement industry-standard security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Encryption in transit (HTTPS/TLS)</li>
              <li>Secure session management with automatic timeout</li>
              <li>Input validation and sanitization</li>
              <li>CSRF protection</li>
              <li>Regular security audits</li>
              <li>Audit logging for security monitoring</li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies & Tracking</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar technologies. You can control cookie preferences at any time:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Necessary Cookies:</strong> Essential for the site to function (always active)</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences (optional)</li>
              <li><strong>Analytics Cookies:</strong> Help us improve our services (optional)</li>
              <li><strong>Marketing Cookies:</strong> Used for personalized advertising (optional)</li>
            </ul>
            <p className="text-gray-700 mt-4">
              For more information, see our{' '}
              <a href="#cookie-policy" className="text-[#D91C81] hover:underline font-medium">
                Cookie Policy
              </a>.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Session Data:</strong> Deleted after 30 minutes of inactivity or on logout</li>
              <li><strong>Preference Data:</strong> Retained until you delete it</li>
              <li><strong>Audit Logs:</strong> Limited to last 100 entries (client-side only)</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
            <p className="text-gray-700">
              We may use third-party services for specific functions (e.g., Unsplash for images). 
              These services have their own privacy policies. We do not share your personal information 
              with third parties without your explicit consent.
            </p>
          </section>

          {/* International Data Transfers */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
            <p className="text-gray-700">
              Your data is processed in your browser (client-side). If we implement server-side 
              processing, we will ensure appropriate safeguards are in place for international transfers.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-700">
              This service is intended for corporate use and is not directed at individuals under 16 years 
              of age. We do not knowingly collect personal information from children.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any material 
              changes by updating the "Last Updated" date at the top of this policy.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about this Privacy Policy or wish to exercise your rights, please contact:
            </p>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-700 font-medium">HALO / RecHUB</p>
              <p className="text-gray-700">Email: privacy@halo.com</p>
              <p className="text-gray-700">Data Protection Officer: dpo@halo.com</p>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="border-t pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Your Privacy</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/privacy-settings"
                className="flex-1 bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white px-6 py-4 rounded-xl font-semibold text-center hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:ring-offset-2"
              >
                Privacy Settings
              </Link>
              <a
                href="#cookie-policy"
                className="flex-1 border-2 border-gray-300 px-6 py-4 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Cookie Policy
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
