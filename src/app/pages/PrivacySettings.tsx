import { Link } from 'react-router';
import { useLanguage } from '../context/LanguageContext';
import { usePrivacy } from '../context/PrivacyContext';
import { LanguageSelector } from '../components/LanguageSelector';
import Logo from '../../imports/Logo';
import { Shield, Check, ArrowLeft } from 'lucide-react';

export function PrivacySettings() {
  const { t } = useLanguage();
  const { privacySettings, setPrivacySettings } = usePrivacy();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Home</span>
              </Link>
            </div>
            <div className="h-8 w-[88px]">
              <Logo />
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-[#D91C81] to-[#B71569] rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Privacy Settings</h1>
              <p className="text-gray-600">Manage your privacy preferences</p>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-6 mt-8">
            {/* Data Collection */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Data Collection</h2>
                  <p className="text-sm text-gray-600">
                    We collect minimal data necessary to process your gift selection and delivery.
                  </p>
                </div>
                <div className="ml-4">
                  <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    <Check className="w-4 h-4" />
                    Compliant
                  </span>
                </div>
              </div>
            </div>

            {/* Cookie Preferences */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Cookie Preferences</h2>
                  <p className="text-sm text-gray-600">
                    Essential cookies are required for the site to function. Analytics cookies help us improve your experience.
                  </p>
                </div>
                <div className="ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Marketing Communications */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Marketing Communications</h2>
                  <p className="text-sm text-gray-600">
                    Receive updates about new gifts, special offers, and company news.
                  </p>
                </div>
                <div className="ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Data Retention */}
            <div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Data Retention</h2>
                  <p className="text-sm text-gray-600">
                    Your data is retained for order fulfillment and legal compliance. You can request deletion at any time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Policy Link */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              to="/privacy-policy"
              className="text-[#D91C81] hover:text-[#B71569] font-medium flex items-center gap-2"
            >
              Read Full Privacy Policy
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8">
            <button className="flex-1 bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
              Save Preferences
            </button>
            <Link
              to="/"
              className="flex-1 bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all text-center"
            >
              Cancel
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> This is a prototype privacy settings page. In production, these settings would be connected to your privacy management system and comply with GDPR, CCPA, and other privacy regulations.
          </p>
        </div>
      </div>
    </div>
  );
}