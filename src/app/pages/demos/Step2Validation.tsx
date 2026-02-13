import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Shield, Mail, IdCard, CreditCard, Link as LinkIcon, Globe, ArrowRight } from 'lucide-react';
import Logo from '../../../imports/Logo';

export function Step2Validation() {
  const [selectedVariation, setSelectedVariation] = useState<'email' | 'employeeId' | 'serialCard' | 'magicLink' | 'sso'>('email');

  const variations = [
    { id: 'email', label: 'Email Validation', description: 'Domain-verified email addresses', icon: Mail },
    { id: 'employeeId', label: 'Employee ID', description: 'Corporate employee ID lookup', icon: IdCard },
    { id: 'serialCard', label: 'Serial Card', description: 'Unique card number validation', icon: CreditCard },
    { id: 'magicLink', label: 'Magic Link', description: 'Passwordless email authentication', icon: LinkIcon },
    { id: 'sso', label: 'SSO', description: 'Single Sign-On (Google, Microsoft, Okta)', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/demos"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">All Demos</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1B2A5E] rounded-lg flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Access Validation</h1>
                  <p className="text-sm text-gray-600">User authentication methods</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Variation Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#1B2A5E]" />
            Select Validation Method
          </h2>
          <div className="grid md:grid-cols-5 gap-4">
            {variations.map((variation) => {
              const IconComponent = variation.icon;
              return (
                <button
                  key={variation.id}
                  onClick={() => setSelectedVariation(variation.id as any)}
                  className={`text-center p-4 rounded-lg border-2 transition-all ${
                    selectedVariation === variation.id
                      ? 'border-[#1B2A5E] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className={`w-6 h-6 mx-auto mb-2 ${
                    selectedVariation === variation.id ? 'text-[#1B2A5E]' : 'text-gray-400'
                  }`} />
                  <div className="font-semibold text-gray-900 text-sm mb-1">{variation.label}</div>
                  <div className="text-xs text-gray-600">{variation.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 border-b border-gray-300">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              <span className="font-mono">https://gifts.company.com/access</span>
            </div>
          </div>

          <div className="min-h-[600px] bg-gradient-to-br from-[#00E5A0] via-[#0066CC] via-[#D91C81] to-[#1B2A5E]">
            {/* Header */}
            <header className="px-6 py-6">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="h-10 w-[110px]" style={{ filter: 'brightness(0) invert(1)' }}>
                  <Logo />
                </div>
                <button className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium backdrop-blur-sm">
                  🌐 English
                </button>
              </div>
            </header>

            {/* Validation Form */}
            <div className="flex items-center justify-center px-4 pb-12 pt-8">
              <div className="max-w-md w-full">
                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl">
                  {/* Email Validation */}
                  {selectedVariation === 'email' && (
                    <>
                      <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-9 h-9 text-[#D91C81]" />
                      </div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">Verify Your Email</h1>
                      <p className="text-gray-600 text-center mb-8">
                        Enter your company email address to continue
                      </p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            placeholder="your.email@company.com"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#D91C81] focus:ring-4 focus:ring-pink-100 outline-none"
                          />
                          <p className="text-xs text-gray-500 mt-2">Please use an email from: @company.com</p>
                        </div>
                        <button className="w-full bg-[#D91C81] hover:bg-[#B71569] text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
                          <span>Continue</span>
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </>
                  )}

                  {/* Employee ID */}
                  {selectedVariation === 'employeeId' && (
                    <>
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <IdCard className="w-9 h-9 text-[#1B2A5E]" />
                      </div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">Employee Verification</h1>
                      <p className="text-gray-600 text-center mb-8">
                        Enter your employee ID to access your gifts
                      </p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Employee ID
                          </label>
                          <input
                            type="text"
                            placeholder="E12345"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#1B2A5E] focus:ring-4 focus:ring-blue-100 outline-none text-center text-lg font-mono"
                          />
                          <p className="text-xs text-gray-500 mt-2">Your 6-digit employee ID</p>
                        </div>
                        <button className="w-full bg-[#1B2A5E] hover:bg-[#152243] text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
                          <span>Verify</span>
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </>
                  )}

                  {/* Serial Card */}
                  {selectedVariation === 'serialCard' && (
                    <>
                      <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <CreditCard className="w-9 h-9 text-[#00B4CC]" />
                      </div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">Enter Card Number</h1>
                      <p className="text-gray-600 text-center mb-8">
                        Enter the serial number from your gift card
                      </p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Serial Card Number
                          </label>
                          <input
                            type="text"
                            placeholder="XXXX-XXXX-XXXX-XXXX"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#00B4CC] focus:ring-4 focus:ring-cyan-100 outline-none text-center text-lg font-mono tracking-wider"
                          />
                          <p className="text-xs text-gray-500 mt-2">Found on the back of your card</p>
                        </div>
                        <button className="w-full bg-[#00B4CC] hover:bg-[#0099B3] text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
                          <span>Redeem</span>
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </>
                  )}

                  {/* Magic Link */}
                  {selectedVariation === 'magicLink' && (
                    <>
                      <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <LinkIcon className="w-9 h-9 text-purple-600" />
                      </div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">Magic Link Login</h1>
                      <p className="text-gray-600 text-center mb-8">
                        We'll send a secure link to your email
                      </p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            placeholder="your.email@company.com"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none"
                          />
                        </div>
                        <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
                          <LinkIcon className="w-5 h-5" />
                          <span>Send Magic Link</span>
                        </button>
                      </div>
                      <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <p className="text-xs font-semibold text-purple-900 mb-1">✨ Passwordless</p>
                        <p className="text-xs text-purple-700">
                          Click the link in your email to sign in instantly - no password needed!
                        </p>
                      </div>
                    </>
                  )}

                  {/* SSO */}
                  {selectedVariation === 'sso' && (
                    <>
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-9 h-9 text-[#0066CC]" />
                      </div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">Single Sign-On</h1>
                      <p className="text-gray-600 text-center mb-8">
                        Sign in with your company account
                      </p>
                      <div className="space-y-3">
                        <button className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-800 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3">
                          <span className="text-2xl">🔵</span>
                          <span>Continue with Google</span>
                        </button>
                        <button className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-800 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3">
                          <span className="text-2xl">⊞</span>
                          <span>Continue with Microsoft</span>
                        </button>
                        <button className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-800 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3">
                          <span className="text-2xl">🔷</span>
                          <span>Continue with Okta</span>
                        </button>
                      </div>
                      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-xs font-semibold text-blue-900 mb-1">🔐 Secure</p>
                        <p className="text-xs text-blue-700">
                          Uses your organization's identity provider for secure authentication
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Details */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">Configuration Details</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Setting:</span>
              <span className="ml-2 text-gray-600">validationMethod: "{selectedVariation}"</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Security:</span>
              <span className="ml-2 text-gray-600">
                {selectedVariation === 'email' && 'Domain validation + rate limiting'}
                {selectedVariation === 'employeeId' && 'Database lookup + encryption'}
                {selectedVariation === 'serialCard' && 'One-time use tokens'}
                {selectedVariation === 'magicLink' && 'Time-limited JWT tokens'}
                {selectedVariation === 'sso' && 'OAuth 2.0 / SAML 2.0'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Next Step:</span>
              <span className="ml-2 text-gray-600">Welcome Page</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}