import { useState } from 'react';
import { Gift, Award, Shield, Package, Heart, Send, MessageCircle, Users, Calendar, ArrowRight, Play, ArrowLeft, Sparkles, Share2, CheckCircle, CreditCard, Truck, Home } from 'lucide-react';
import { Link } from 'react-router';

type PreviewMode = 'complete-flow' | 'landing-skip' | 'welcome' | 'celebration';

export function FeaturePreview() {
  const [activePreview, setActivePreview] = useState<PreviewMode>('welcome');
  const [videoPlaying, setVideoPlaying] = useState(false);

  const primaryColor = '#D91C81';
  const secondaryColor = '#1B2A5E';
  const tertiaryColor = '#00B4CC';

  // Sample celebration messages
  const sampleMessages = [
    {
      id: '1',
      senderName: 'Sarah Johnson',
      senderRole: 'manager' as const,
      message: 'Congratulations on your 5 year anniversary! Your dedication and hard work have been instrumental to our team\'s success. Thank you for everything you do!',
      createdAt: new Date().toISOString(),
      photoUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
      eCardColor: '#FF6B9D',
      eCardGradient: 'linear-gradient(135deg, #FF6B9D 0%, #FFD93D 100%)',
      eCardIcon: '🎊',
      eCardText: 'Congratulations!',
    },
    {
      id: '2',
      senderName: 'Mike Chen',
      senderRole: 'peer' as const,
      message: 'Happy work anniversary! It\'s been amazing working alongside you. Here\'s to many more years of collaboration!',
      createdAt: new Date().toISOString(),
      eCardColor: '#6C5CE7',
      eCardGradient: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
      eCardIcon: '🌟',
      eCardText: 'Well Done!',
    },
    {
      id: '3',
      senderName: 'Emily Rodriguez',
      senderRole: 'leadership' as const,
      message: 'Thank you for your outstanding contributions over the years. Your commitment to excellence sets a great example for everyone on the team!',
      createdAt: new Date().toISOString(),
      eCardColor: '#00B4CC',
      eCardGradient: 'linear-gradient(135deg, #00B4CC 0%, #FFD93D 100%)',
      eCardIcon: '💙',
      eCardText: 'Thank You!',
    },
    {
      id: '4',
      senderName: 'David Park',
      senderRole: 'external' as const,
      message: 'It has been a pleasure partnering with you over the years. Your professionalism and expertise are truly appreciated!',
      createdAt: new Date().toISOString(),
      eCardColor: '#FD79A8',
      eCardGradient: 'linear-gradient(135deg, #FD79A8 0%, #FDCB6E 100%)',
      eCardIcon: '🎈',
      eCardText: 'Celebration!',
    },
    {
      id: '5',
      senderName: 'Lisa Martinez',
      senderRole: 'peer' as const,
      message: 'Your positive attitude and innovative ideas have made such a difference. Congratulations on this milestone!',
      createdAt: new Date().toISOString(),
      eCardColor: '#D91C81',
      eCardGradient: 'linear-gradient(135deg, #D91C81 0%, #1B2A5E 100%)',
      eCardIcon: '✨',
      eCardText: 'Amazing!',
    },
    {
      id: '6',
      senderName: 'James Wilson',
      senderRole: 'manager' as const,
      message: 'Five years of excellence! Your leadership and dedication inspire us all. Thank you for being such an important part of our team.',
      createdAt: new Date().toISOString(),
      eCardColor: '#1B2A5E',
      eCardGradient: 'linear-gradient(135deg, #1B2A5E 0%, #00B4CC 100%)',
      eCardIcon: '🏆',
      eCardText: 'Champion!',
    },
    {
      id: '7',
      senderName: 'Rachel Kim',
      senderRole: 'peer' as const,
      message: 'Working with you has been a joy! Your creativity and teamwork make every project better. Cheers to many more years together!',
      createdAt: new Date().toISOString(),
      eCardColor: '#FF6B9D',
      eCardGradient: 'linear-gradient(135deg, #FF6B9D 0%, #FFFFFF 100%)',
      eCardIcon: '🌸',
      eCardText: 'Appreciation',
    },
    {
      id: '8',
      senderName: 'Tom Anderson',
      senderRole: 'leadership' as const,
      message: 'Your contributions over these five years have been invaluable. Thank you for your commitment and passion!',
      createdAt: new Date().toISOString(),
      eCardColor: '#00B4CC',
      eCardGradient: 'linear-gradient(135deg, #00B4CC 0%, #0066CC 100%)',
      eCardIcon: '⭐',
      eCardText: 'Outstanding!',
    },
  ];

  const roleColors = {
    peer: 'bg-blue-100 text-blue-700',
    manager: 'bg-purple-100 text-purple-700',
    external: 'bg-green-100 text-green-700',
    leadership: 'bg-red-100 text-red-700',
  };

  const roleLabels = {
    peer: 'Colleague',
    manager: 'Manager',
    external: 'External Partner',
    leadership: 'Leadership',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Feature Selector Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Feature Preview</h1>
            <a 
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to App
            </a>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActivePreview('complete-flow')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                activePreview === 'complete-flow'
                  ? 'bg-[#D91C81] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              1. Complete Flow
            </button>
            <button
              onClick={() => setActivePreview('landing-skip')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                activePreview === 'landing-skip'
                  ? 'bg-[#D91C81] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              2. Optional Landing Page
            </button>
            <button
              onClick={() => setActivePreview('welcome')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                activePreview === 'welcome'
                  ? 'bg-[#D91C81] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              3. Welcome Page
            </button>
            <button
              onClick={() => setActivePreview('celebration')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                activePreview === 'celebration'
                  ? 'bg-[#D91C81] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              4. Celebration Module
            </button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Feature 1: Complete Flow */}
        {activePreview === 'complete-flow' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#D91C81] to-[#1B2A5E] rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-3">Complete 6-Step User Flow</h2>
              <p className="text-white/90 text-lg">
                A comprehensive walkthrough of the entire gifting experience from landing to confirmation
              </p>
            </div>

            {/* Step 1: Landing Page */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b-2 border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#D91C81] rounded-full flex items-center justify-center text-white font-bold text-xl">
                    1
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Landing Page</h3>
                    <p className="text-gray-600">Brand introduction and call-to-action</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Key Elements:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <Home className="w-5 h-5 text-[#D91C81] flex-shrink-0 mt-0.5" />
                        <span>Hero section with company branding</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Gift className="w-5 h-5 text-[#D91C81] flex-shrink-0 mt-0.5" />
                        <span>Feature highlights and benefits</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="w-5 h-5 text-[#D91C81] flex-shrink-0 mt-0.5" />
                        <span>Trust indicators and security</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-[#D91C81] flex-shrink-0 mt-0.5" />
                        <span>Prominent CTA button</span>
                      </li>
                    </ul>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-800">
                        <strong>Optional:</strong> Can be skipped if skipLandingPage = true
                      </p>
                    </div>
                  </div>
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-br from-[#00E5A0] via-[#0066CC] to-[#D91C81] p-12 text-white text-center">
                      <div className="text-3xl font-bold mb-3">Your Company</div>
                      <div className="text-lg mb-6 opacity-90">Celebrating Your Milestone</div>
                      <div className="inline-block bg-white text-[#D91C81] px-8 py-3 rounded-xl text-lg font-bold">
                        Get Your Gift →
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Access Validation */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b-2 border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#1B2A5E] rounded-full flex items-center justify-center text-white font-bold text-xl">
                    2
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Access Validation</h3>
                    <p className="text-gray-600">Secure authentication methods</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Validation Methods:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#00B4CC] flex-shrink-0 mt-0.5" />
                        <span><strong>Email Address:</strong> Work email verification</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#00B4CC] flex-shrink-0 mt-0.5" />
                        <span><strong>Employee ID:</strong> Company ID number</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#00B4CC] flex-shrink-0 mt-0.5" />
                        <span><strong>Serial Card:</strong> Unique card numbers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#00B4CC] flex-shrink-0 mt-0.5" />
                        <span><strong>Magic Link:</strong> Email-based authentication</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#00B4CC] flex-shrink-0 mt-0.5" />
                        <span><strong>SSO:</strong> Single Sign-On (Google, Microsoft, Okta, Azure)</span>
                      </li>
                    </ul>
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-xs text-purple-800">
                        <strong>Configurable:</strong> Admins select which methods to enable per site
                      </p>
                    </div>
                  </div>
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white p-8">
                    <div className="text-center mb-6">
                      <div className="text-2xl font-bold text-gray-900 mb-2">Verify Your Access</div>
                      <div className="text-sm text-gray-600">Enter your credentials to continue</div>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Email or Employee ID"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm"
                        disabled
                      />
                      <button
                        className="w-full px-6 py-3 bg-[#1B2A5E] text-white rounded-lg font-semibold text-sm"
                        disabled
                      >
                        Verify & Continue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Welcome Page (Optional) */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 border-b-2 border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#D91C81] rounded-full flex items-center justify-center text-white font-bold text-xl">
                    3
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Welcome Page</h3>
                    <p className="text-gray-600">Personalized greeting and celebration messages</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Features:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <MessageCircle className="w-5 h-5 text-[#D91C81] flex-shrink-0 mt-0.5" />
                        <span>CEO/Leadership letter (letter or video format)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Award className="w-5 h-5 text-[#D91C81] flex-shrink-0 mt-0.5" />
                        <span>Celebration wall with colleague messages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Sparkles className="w-5 h-5 text-[#D91C81] flex-shrink-0 mt-0.5" />
                        <span>eCard designs with unique patterns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-[#D91C81] flex-shrink-0 mt-0.5" />
                        <span>Sticky bottom CTA to gift selection</span>
                      </li>
                    </ul>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-800">
                        <strong>Optional:</strong> Can be disabled if not needed for the campaign
                      </p>
                    </div>
                  </div>
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6">
                      <div className="bg-white rounded-lg p-6 shadow-md">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-[#D91C81] rounded-full flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="text-sm font-bold text-gray-900 mb-1">Leadership Letter</div>
                            <div className="text-xs text-gray-600">Personalized message</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-16 bg-pink-100 rounded"></div>
                          <div className="h-16 bg-purple-100 rounded"></div>
                          <div className="h-16 bg-cyan-100 rounded"></div>
                        </div>
                        <div className="mt-4 text-center">
                          <div className="text-xs text-gray-600 mb-2">8 Celebration Messages</div>
                          <div className="h-8 bg-[#D91C81] rounded-lg"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Gift Selection */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 border-b-2 border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#00B4CC] rounded-full flex items-center justify-center text-white font-bold text-xl">
                    4
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Gift Selection</h3>
                    <p className="text-gray-600">Browse and select from available gifts</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Features:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <Gift className="w-5 h-5 text-[#00B4CC] flex-shrink-0 mt-0.5" />
                        <span>Grid layout with high-quality product images</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Package className="w-5 h-5 text-[#00B4CC] flex-shrink-0 mt-0.5" />
                        <span>Category filtering and search</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CreditCard className="w-5 h-5 text-[#00B4CC] flex-shrink-0 mt-0.5" />
                        <span>Point value display</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-[#00B4CC] flex-shrink-0 mt-0.5" />
                        <span>Quick view and detailed product pages</span>
                      </li>
                    </ul>
                  </div>
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="aspect-square bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-1"></div>
                        <div className="h-2 bg-gray-100 rounded"></div>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="aspect-square bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-1"></div>
                        <div className="h-2 bg-gray-100 rounded"></div>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="aspect-square bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-1"></div>
                        <div className="h-2 bg-gray-100 rounded"></div>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="aspect-square bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-1"></div>
                        <div className="h-2 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5: Shipping Information */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b-2 border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    5
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Shipping Information</h3>
                    <p className="text-gray-600">Delivery details and preferences</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Features:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <Truck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Shipping address collection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Home className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Address validation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Package className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Special delivery instructions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Privacy-compliant data collection</span>
                      </li>
                    </ul>
                  </div>
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white p-6">
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-medium text-gray-700 mb-1">Full Name</div>
                        <div className="h-10 bg-gray-100 rounded"></div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-700 mb-1">Street Address</div>
                        <div className="h-10 bg-gray-100 rounded"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs font-medium text-gray-700 mb-1">City</div>
                          <div className="h-10 bg-gray-100 rounded"></div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-700 mb-1">ZIP</div>
                          <div className="h-10 bg-gray-100 rounded"></div>
                        </div>
                      </div>
                      <div className="h-10 bg-green-600 rounded mt-4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 6: Confirmation */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b-2 border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Order Confirmation</h3>
                    <p className="text-gray-600">Success message and order tracking</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Features:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Order confirmation number</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Package className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Order summary with gift details</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Truck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Estimated delivery timeline</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <MessageCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Order tracking link</span>
                      </li>
                    </ul>
                  </div>
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 p-8 text-center">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</div>
                    <div className="text-sm text-gray-600 mb-4">Your gift is on its way</div>
                    <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                      <div className="text-xs text-gray-600 mb-1">Order Number</div>
                      <div className="font-mono font-bold text-gray-900">#ORD-2024-001</div>
                    </div>
                    <div className="h-10 bg-green-600 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-[#D91C81] to-[#1B2A5E] rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Flow Summary</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold mb-2">6</div>
                  <div className="text-white/90">Total Steps</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">2</div>
                  <div className="text-white/90">Optional Steps</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">5</div>
                  <div className="text-white/90">Validation Methods</div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-white/10 rounded-lg">
                <p className="text-sm text-white/90">
                  The flow is highly configurable per site. Admins can enable/disable optional steps, 
                  choose validation methods, customize branding, and configure celebration features to 
                  match each client's specific needs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Feature 2: Optional Landing Page */}
        {activePreview === 'landing-skip' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Feature 2: Optional Landing Page</h2>
              <p className="text-gray-600 mb-6">
                When enabled in admin settings, the landing page is automatically skipped and users go directly to the authentication page.
              </p>
              
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">✓</div>
                    <div>
                      <h3 className="font-semibold text-green-900 mb-1">Setting: skipLandingPage = false (Default)</h3>
                      <p className="text-green-800 text-sm">User Flow: <code className="bg-white px-2 py-0.5 rounded">/ (Landing)</code> → <code className="bg-white px-2 py-0.5 rounded">/access</code></p>
                      <p className="text-green-700 text-sm mt-2">Landing page displays with branding, features, and call-to-action.</p>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">⚡</div>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Setting: skipLandingPage = true</h3>
                      <p className="text-blue-800 text-sm">User Flow: <code className="bg-white px-2 py-0.5 rounded">/ (Auto-redirect)</code> → <code className="bg-white px-2 py-0.5 rounded">/access</code></p>
                      <p className="text-blue-700 text-sm mt-2">Landing page is skipped entirely. Users immediately see the authentication page.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Use Cases:</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li><strong>Event Gifting:</strong> Skip landing when employees receive direct invitation links</li>
                  <li><strong>Service Awards:</strong> Skip landing for automated anniversary campaigns</li>
                  <li><strong>Onboarding Kits:</strong> Keep landing for new employee welcome experience</li>
                  <li><strong>Custom Portals:</strong> Skip landing when embedding in existing HR systems</li>
                </ul>
              </div>
            </div>

            {/* Visual Demo */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Visual Comparison</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Normal Flow */}
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Normal Flow (skipLandingPage = false)</div>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-br from-[#00E5A0] via-[#0066CC] to-[#D91C81] p-8 text-white text-center">
                      <div className="text-2xl font-bold mb-2">Landing Page</div>
                      <div className="text-sm opacity-90">Branding, Features, CTA</div>
                      <div className="mt-4 inline-block bg-white text-[#D91C81] px-4 py-2 rounded-lg text-sm font-semibold">
                        Get Your Gift →
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skipped Flow */}
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Direct to Auth (skipLandingPage = true)</div>
                  <div className="border-2 border-blue-500 rounded-lg overflow-hidden">
                    <div className="bg-white p-8 text-center">
                      <div className="text-2xl font-bold mb-2 text-gray-900">Access Validation</div>
                      <div className="text-sm text-gray-600">Enter your credentials</div>
                      <div className="mt-4 space-y-2">
                        <div className="h-10 bg-gray-100 rounded"></div>
                        <div className="h-10 bg-blue-500 rounded text-white flex items-center justify-center text-sm font-semibold">
                          Continue
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature 3: Welcome Page */}
        {activePreview === 'welcome' && (
          <div className="space-y-6">
            {/* Configuration Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Feature 3: Welcome Page Configuration</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Available Settings:</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>✓ Enable/Disable Welcome Page</li>
                    <li>✓ Custom Title</li>
                    <li>✓ Custom Message (multi-line)</li>
                    <li>✓ Hero Image or Video</li>
                    <li>✓ Author Name & Title</li>
                    <li>✓ Custom CTA Button Text</li>
                    <li>✓ Integration with Celebration Messages</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Design Features:</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Card-based message layout</li>
                    <li>• Responsive grid (3 columns on desktop)</li>
                    <li>• Sticky bottom navigation bar</li>
                    <li>• Integrated celebration messages</li>
                    <li>• Dark blue footer with CTA</li>
                    <li>• Smooth hover animations</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-gray-100 rounded-xl p-6">
              <div className="text-sm font-medium text-gray-700 mb-4">Live Preview (Letter with Image Layout):</div>
              
              <div className="bg-white rounded-lg overflow-hidden shadow-xl">
                {/* Hero Section - Letter Style */}
                <div 
                  className="px-4 py-16 md:py-20"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}15 100%)`
                  }}
                >
                  <div className="max-w-6xl mx-auto">
                    {/* Letter Layout - Image + Text Side by Side */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                      <div className="grid md:grid-cols-2 gap-0">
                        {/* Left Side - Leadership Image */}
                        <div className="relative h-[300px] md:h-auto">
                          {!videoPlaying ? (
                            <img
                              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=800&fit=crop"
                              alt="Leadership"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-black flex items-center justify-center">
                              <div className="text-white text-center p-4">
                                <div className="text-2xl mb-2">🎥</div>
                                <p className="text-sm mb-4">Video Player</p>
                                <button 
                                  onClick={() => setVideoPlaying(false)}
                                  className="px-4 py-2 bg-white/20 rounded-lg text-sm"
                                >
                                  Close Video
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Side - Letter Content */}
                        <div className="p-8 md:p-12 flex flex-col justify-center">
                          <h1 
                            className="text-3xl md:text-4xl font-bold mb-6"
                            style={{ color: primaryColor }}
                          >
                            Congratulations on Your Anniversary!
                          </h1>

                          <div className="prose prose-lg max-w-none mb-8">
                            <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                              Your dedication and commitment over the years have been invaluable to our team. Today, we celebrate your contributions and the positive impact you've made on our organization.
                              <br /><br />
                              As a token of our appreciation for your continued service, we invite you to select a special gift. Thank you for being such an important part of our success.
                            </p>
                          </div>

                          {/* Author Signature */}
                          <div className="mt-auto pt-6 border-t border-gray-200">
                            <div className="flex items-center gap-4">
                              <div 
                                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                                style={{ backgroundColor: primaryColor }}
                              >
                                JS
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-lg">Jennifer Smith</p>
                                <p className="text-gray-600 text-sm">Chief Executive Officer</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Celebration Messages - Card Grid */}
                <div className="max-w-6xl mx-auto px-4 py-16 bg-gray-50">
                  <div className="text-center mb-12">
                    <h2 
                      className="text-3xl md:text-4xl font-bold mb-4"
                      style={{ color: primaryColor }}
                    >
                      Messages from Your Team
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Your colleagues have shared their congratulations and appreciation
                    </p>
                  </div>

                  {/* Card Grid - 3 sample cards showing eCards */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {sampleMessages.slice(0, 3).map((msg, idx) => (
                      <div
                        key={msg.id}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer overflow-hidden"
                      >
                        {/* eCard Preview - Simplified for demo */}
                        <div className="p-4">
                          <div 
                            className="w-full h-32 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                            style={{ 
                              backgroundColor: idx === 0 ? '#FF6B9D' : idx === 1 ? '#6C5CE7' : '#00B4CC',
                              background: idx === 0 
                                ? 'linear-gradient(135deg, #FF6B9D 0%, #FFD93D 100%)' 
                                : idx === 1 
                                ? 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)'
                                : 'linear-gradient(135deg, #00B4CC 0%, #FFD93D 100%)'
                            }}
                          >
                            {idx === 0 ? '🎊 Congratulations!' : idx === 1 ? '🌟 Well Done!' : '💙 Thank You!'}
                          </div>
                        </div>

                        {/* Message Text */}
                        <div className="px-6 pb-4">
                          <p className="text-gray-700 text-sm leading-relaxed italic mb-4">
                            "{msg.message}"
                          </p>

                          {/* Sender Info */}
                          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                              style={{ backgroundColor: primaryColor }}
                            >
                              {msg.senderName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {msg.senderName}
                              </p>
                              <p className="text-gray-600 text-xs capitalize">
                                {msg.senderRole === 'leadership' ? 'Leadership Team' : msg.senderRole}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* View All Link */}
                  <div className="text-center">
                    <button
                      className="inline-flex items-center gap-2 text-lg font-semibold hover:gap-3 transition-all"
                      style={{ color: primaryColor }}
                    >
                      <MessageCircle className="w-5 h-5" />
                      View all messages & add yours
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Bottom Navigation Bar - Dark Blue */}
                <div 
                  className="py-6 px-4 shadow-lg"
                  style={{ backgroundColor: secondaryColor }}
                >
                  <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
                    <div className="text-white">
                      <p className="font-semibold text-lg">Ready to choose your gift?</p>
                      <p className="text-white/80 text-sm">Let's get started with your selection</p>
                    </div>
                    <button
                      className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:shadow-lg group"
                      style={{ 
                        backgroundColor: primaryColor,
                        boxShadow: `0 4px 14px ${primaryColor}40`
                      }}
                    >
                      <span className="text-white">Continue</span>
                      <ArrowRight className="w-5 h-5 text-white transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Key Design Elements</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-xs font-bold">1</div>
                    Letter Layout (Default)
                  </h4>
                  <p className="text-sm text-gray-600 ml-8">
                    Side-by-side image and text layout, like a traditional business letter with CEO photo
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">2</div>
                    Optional Video Support
                  </h4>
                  <p className="text-sm text-gray-600 ml-8">
                    If video is provided, shows play button overlay on image
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">3</div>
                    eCard Messages
                  </h4>
                  <p className="text-sm text-gray-600 ml-8">
                    White cards with colorful eCard designs at top, message below
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">4</div>
                    Author Signature
                  </h4>
                  <p className="text-sm text-gray-600 ml-8">
                    Professional signature section with name and title
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature 4: Celebration Module */}
        {activePreview === 'celebration' && (
          <div className="space-y-6">
            {/* Configuration Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Feature 4: Celebration Module Configuration</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Available Settings:</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>✓ Enable/Disable Module</li>
                    <li>✓ Standalone or Integrated Mode</li>
                    <li>✓ Allow Peer Messages</li>
                    <li>✓ Allow Manager Messages</li>
                    <li>✓ Allow External Messages</li>
                    <li>✓ Require Approval/Moderation</li>
                    <li>✓ Message Character Limit</li>
                    <li>✓ Allow Photos & Videos</li>
                    <li>✓ Display Mode (Wall/Grid/Carousel)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Use Cases:</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Service Anniversary Celebrations</li>
                    <li>• Retirement Recognition</li>
                    <li>• Team Milestone Achievements</li>
                    <li>• Employee Appreciation Events</li>
                    <li>• Welcome Messages for New Hires</li>
                  </ul>
                </div>
              </div>
            </div>



            {/* Display Mode Comparison */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Display Modes</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="font-medium text-gray-900 mb-2">Wall (Default)</div>
                  <div className="space-y-2">
                    <div className="h-16 bg-gray-100 rounded"></div>
                    <div className="h-16 bg-gray-100 rounded"></div>
                    <div className="h-16 bg-gray-100 rounded"></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Vertical stacked layout</p>
                </div>
                <div className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="font-medium text-gray-900 mb-2">Grid</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-16 bg-gray-100 rounded"></div>
                    <div className="h-16 bg-gray-100 rounded"></div>
                    <div className="h-16 bg-gray-100 rounded"></div>
                    <div className="h-16 bg-gray-100 rounded"></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">2-column responsive grid</p>
                </div>
                <div className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="font-medium text-gray-900 mb-2">Carousel</div>
                  <div className="flex gap-2 overflow-x-hidden">
                    <div className="h-24 w-32 bg-gray-100 rounded flex-shrink-0"></div>
                    <div className="h-24 w-32 bg-gray-100 rounded flex-shrink-0"></div>
                    <div className="h-24 w-32 bg-gray-100 rounded flex-shrink-0"></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Horizontal scrolling</p>
                </div>
              </div>
            </div>

            {/* Interactive Demos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Try the Live Experiences</h3>
              <p className="text-gray-600 mb-6">
                Explore both celebration experiences with interactive demos:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Message Creation Experience */}
                <div className="border-2 border-[#D91C81] rounded-xl p-6 bg-gradient-to-br from-pink-50 to-purple-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#D91C81] rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Message Creation</h4>
                      <p className="text-sm text-gray-600">Peer/Manager Flow</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    Experience the 3-step flow for colleagues to create celebration messages with eCard selection, personal message, and invite others.
                  </p>
                  <Link 
                    to="/celebrate/demo-recipient/demo-milestone"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#D91C81] text-white rounded-xl font-semibold hover:bg-[#C01872] transition-colors w-full justify-center"
                  >
                    <Sparkles className="w-5 h-5" />
                    Create a Message
                  </Link>
                </div>

                {/* Celebration Wall Experience */}
                <div className="border-2 border-[#1B2A5E] rounded-xl p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#1B2A5E] rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Celebration Wall</h4>
                      <p className="text-sm text-gray-600">Recipient View</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    View the standalone celebration wall where employees can see all their celebration messages across multiple milestones and awards.
                  </p>
                  <Link 
                    to="/celebration"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B2A5E] text-white rounded-xl font-semibold hover:bg-[#0F1A3F] transition-colors w-full justify-center"
                  >
                    <Award className="w-5 h-5" />
                    View Celebration Wall
                  </Link>
                </div>
              </div>

              {/* Flow Diagram */}
              <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-4">User Flow Overview</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-sm font-bold">1</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Peer receives invite link</p>
                      <p className="text-xs text-gray-600">Via email or direct share</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-sm font-bold">2</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Selects eCard template</p>
                      <p className="text-xs text-gray-600">8 unique designs with patterns</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-sm font-bold">3</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Writes personal message</p>
                      <p className="text-xs text-gray-600">With optional photo attachment</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-sm font-bold">4</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Previews and submits</p>
                      <p className="text-xs text-gray-600">See exactly how it will appear</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 text-green-700 rounded-lg flex items-center justify-center text-sm font-bold">✓</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Invites others to celebrate</p>
                      <p className="text-xs text-gray-600">Copy link or send email invites</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FeaturePreview;