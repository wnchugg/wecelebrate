import { useState } from 'react';
import { usePrivacy } from '../context/PrivacyContext';
import { Download, Trash2, Shield, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function PrivacySettings() {
  const { 
    preferences, 
    exportUserData, 
    deleteUserData, 
    withdrawConsent,
    setDoNotSell 
  } = usePrivacy();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExportData = async () => {
    try {
      const data = await exportUserData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Your data has been exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleDeleteData = async () => {
    try {
      await deleteUserData();
      setShowDeleteConfirm(false);
      toast.success('Your data has been deleted');
      // In production, would also call backend API to delete server-side data
    } catch (error) {
      toast.error('Failed to delete data');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-[#D91C81]" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Privacy & Data Settings</h1>
          <p className="text-gray-600">Manage your privacy preferences and data</p>
        </div>
      </div>

      {/* Current Consent Status */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#D91C81]" aria-hidden="true" />
          Your Current Preferences
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Necessary Cookies</span>
            <CheckCircle className="w-5 h-5 text-green-600" aria-label="Active" />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Functional Cookies</span>
            {preferences.consents.functional ? (
              <CheckCircle className="w-5 h-5 text-green-600" aria-label="Active" />
            ) : (
              <EyeOff className="w-5 h-5 text-gray-400" aria-label="Inactive" />
            )}
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Analytics Cookies</span>
            {preferences.consents.analytics ? (
              <CheckCircle className="w-5 h-5 text-green-600" aria-label="Active" />
            ) : (
              <EyeOff className="w-5 h-5 text-gray-400" aria-label="Inactive" />
            )}
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Marketing Cookies</span>
            {preferences.consents.marketing ? (
              <CheckCircle className="w-5 h-5 text-green-600" aria-label="Active" />
            ) : (
              <EyeOff className="w-5 h-5 text-gray-400" aria-label="Inactive" />
            )}
          </div>
        </div>
        {preferences.consentTimestamp && (
          <p className="text-sm text-gray-500">
            Last updated: {new Date(preferences.consentTimestamp).toLocaleString()}
          </p>
        )}
      </section>

      {/* CCPA - Do Not Sell */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">California Privacy Rights (CCPA)</h2>
        <p className="text-gray-600">
          California residents have the right to opt-out of the sale of their personal information.
        </p>
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div>
            <p className="font-semibold text-gray-900">Do Not Sell My Personal Information</p>
            <p className="text-sm text-gray-600">Opt-out of data sharing for marketing purposes</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.doNotSell}
              onChange={(e) => setDoNotSell(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81]"></div>
          </label>
        </div>
      </section>

      {/* GDPR Rights */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Your Data Rights (GDPR)</h2>
        <p className="text-gray-600">
          You have the right to access, export, and delete your personal data.
        </p>
        
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Export Data */}
          <button
            onClick={handleExportData}
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-[#D91C81] hover:bg-pink-50 transition-all text-left focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:ring-offset-2"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-blue-600" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Export My Data</p>
              <p className="text-sm text-gray-600">Download all your data</p>
            </div>
          </button>

          {/* Delete Data */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-red-600" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Delete My Data</p>
              <p className="text-sm text-gray-600">Permanently erase data</p>
            </div>
          </button>
        </div>
      </section>

      {/* Withdraw Consent */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Consent</h2>
        <button
          onClick={withdrawConsent}
          className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          Withdraw All Consent
        </button>
        <p className="text-sm text-gray-600 mt-3">
          This will reset all your privacy preferences and show the consent banner again.
        </p>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" role="alertdialog" aria-labelledby="delete-title" aria-describedby="delete-description">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" aria-hidden="true" />
              </div>
              <h3 id="delete-title" className="text-xl font-bold text-gray-900">Delete All Data?</h3>
            </div>
            <p id="delete-description" className="text-gray-700 mb-6">
              This action will permanently delete all your data stored on this device. 
              This cannot be undone. Are you sure you want to continue?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteData}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
              >
                Yes, Delete Everything
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-gray-300 px-6 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}