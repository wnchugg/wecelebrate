import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Home, ArrowRight, Globe, Building2 } from 'lucide-react';
import Logo from '../../../imports/Logo';

export function Step1Landing() {
  const [selectedVariation, setSelectedVariation] = useState<'standard' | 'skip' | 'multisite'>('standard');

  const variations = [
    { id: 'standard', label: 'Standard Landing', description: 'Full branded landing page experience' },
    { id: 'skip', label: 'Skip to Auth', description: 'Direct to validation (no landing page)' },
    { id: 'multisite', label: 'Multi-Site Selection', description: 'User selects from multiple sites' }
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
                <div className="w-10 h-10 bg-[#D91C81] rounded-lg flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Landing Page</h1>
                  <p className="text-sm text-gray-600">Branded welcome experience</p>
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
            <Home className="w-5 h-5 text-[#D91C81]" />
            Select Variation
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {variations.map((variation) => (
              <button
                key={variation.id}
                onClick={() => setSelectedVariation(variation.id as any)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  selectedVariation === variation.id
                    ? 'border-[#D91C81] bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-gray-900 mb-1">{variation.label}</div>
                <div className="text-sm text-gray-600">{variation.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 border-b border-gray-300">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              <span className="font-mono">https://gifts.company.com</span>
            </div>
          </div>

          {/* Standard Landing */}
          {selectedVariation === 'standard' && (
            <div className="bg-gradient-to-br from-[#00E5A0] via-[#0066CC] via-[#D91C81] to-[#1B2A5E] min-h-[600px]">
              {/* Header */}
              <header className="px-6 py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                  <div className="h-10 w-[110px]" style={{ filter: 'brightness(0) invert(1)' }}>
                    <Logo />
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="text-white hover:text-white/90 font-medium">
                      Help
                    </button>
                    <button className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium backdrop-blur-sm">
                      🌐 English
                    </button>
                  </div>
                </div>
              </header>

              {/* Hero Content */}
              <div className="px-6 py-16 text-center">
                <div className="max-w-3xl mx-auto">
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                    Welcome to Your<br />Gift Experience
                  </h1>
                  <p className="text-xl text-white/90 mb-8 leading-relaxed">
                    We're excited to celebrate you! Choose from our curated selection of 
                    premium gifts as a token of our appreciation.
                  </p>
                  <button className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#D91C81] rounded-xl font-bold text-lg hover:shadow-2xl transition-all group">
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="px-6 pb-12">
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
                    <div className="text-3xl mb-3">🎁</div>
                    <h3 className="font-bold mb-2">Premium Selection</h3>
                    <p className="text-sm text-white/80">Curated gifts from top brands</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
                    <div className="text-3xl mb-3">🚚</div>
                    <h3 className="font-bold mb-2">Free Shipping</h3>
                    <p className="text-sm text-white/80">Delivered right to your door</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
                    <div className="text-3xl mb-3">⚡</div>
                    <h3 className="font-bold mb-2">Quick & Easy</h3>
                    <p className="text-sm text-white/80">Select your gift in minutes</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Skip to Auth */}
          {selectedVariation === 'skip' && (
            <div className="min-h-[600px] bg-gradient-to-br from-[#00E5A0] via-[#0066CC] via-[#D91C81] to-[#1B2A5E] flex items-center justify-center p-6">
              <div className="max-w-md w-full">
                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl">
                  <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Home className="w-9 h-9 text-[#D91C81]" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">Access Your Gifts</h1>
                  <p className="text-gray-600 text-center mb-8">
                    Enter your email address to continue
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
                    </div>
                    <button className="w-full bg-[#D91C81] hover:bg-[#B71569] text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
                      <span>Continue</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-center text-gray-500 text-sm mt-6">
                    By continuing, you agree to our Terms of Service
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Multi-Site Selection */}
          {selectedVariation === 'multisite' && (
            <div className="min-h-[600px] bg-gradient-to-br from-pink-50 to-blue-50 p-6 md:p-12">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#D91C81] to-[#1B2A5E] rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">Select Your Location</h1>
                  <p className="text-gray-600 text-lg">
                    Choose your region to access your personalized gift experience
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <button className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#D91C81] hover:shadow-xl transition-all text-left group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">🇺🇸</div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#D91C81] group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">North America</h3>
                    <p className="text-gray-600">United States & Canada</p>
                  </button>

                  <button className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#D91C81] hover:shadow-xl transition-all text-left group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">🇪🇺</div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#D91C81] group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Europe</h3>
                    <p className="text-gray-600">European Union & UK</p>
                  </button>

                  <button className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#D91C81] hover:shadow-xl transition-all text-left group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">🌏</div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#D91C81] group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Asia Pacific</h3>
                    <p className="text-gray-600">APAC Region</p>
                  </button>

                  <button className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#D91C81] hover:shadow-xl transition-all text-left group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">🌍</div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#D91C81] group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Global</h3>
                    <p className="text-gray-600">All Other Regions</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Configuration Details */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">Configuration Details</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Setting:</span>
              <span className="ml-2 text-gray-600">
                {selectedVariation === 'standard' && 'skipLandingPage: false'}
                {selectedVariation === 'skip' && 'skipLandingPage: true'}
                {selectedVariation === 'multisite' && 'enableMultiSiteSelection: true'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Next Step:</span>
              <span className="ml-2 text-gray-600">
                {selectedVariation === 'multisite' ? 'Site Selection → Access Validation' : 'Access Validation'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}