import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, PartyPopper, Globe, ArrowRight, Video, MessageCircle } from 'lucide-react';

export function Step3Welcome() {
  const [selectedVariation, setSelectedVariation] = useState<'letter' | 'video' | 'celebration' | 'skip'>('letter');

  const variations = [
    { id: 'letter', label: 'Letter Layout', description: 'Traditional letter with CEO photo' },
    { id: 'video', label: 'Video Message', description: 'Embedded video from leadership' },
    { id: 'celebration', label: 'With Celebration', description: 'Integrated milestone celebration' },
    { id: 'skip', label: 'Skip Welcome', description: 'Go directly to gift selection' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/demos" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">All Demos</span>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00B4CC] rounded-lg flex items-center justify-center text-white font-bold">3</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Welcome Message</h1>
                <p className="text-sm text-gray-600">Personalized greeting experience</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PartyPopper className="w-5 h-5 text-[#00B4CC]" />
            Select Variation
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {variations.map((variation) => (
              <button
                key={variation.id}
                onClick={() => setSelectedVariation(variation.id as any)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  selectedVariation === variation.id ? 'border-[#00B4CC] bg-cyan-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-gray-900 mb-1">{variation.label}</div>
                <div className="text-sm text-gray-600">{variation.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 border-b border-gray-300">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              <span className="font-mono">https://gifts.company.com/welcome</span>
            </div>
          </div>

          {selectedVariation === 'letter' && (
            <div className="min-h-[600px] bg-gradient-to-br from-pink-50 to-blue-50 p-6 md:p-12">
              <div className="max-w-6xl mx-auto">
                {/* Letter Layout - Image + Text Side by Side */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Left Side - Leadership Image */}
                    <div className="relative h-[300px] md:h-auto">
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=800&fit=crop"
                        alt="CEO Jennifer Smith"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Right Side - Letter Content */}
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                      <h1 className="text-3xl md:text-4xl font-bold text-[#D91C81] mb-6">
                        Congratulations on Your Anniversary!
                      </h1>

                      <div className="prose prose-lg max-w-none mb-8">
                        <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                          Dear Sarah,
                          <br /><br />
                          Your dedication and commitment over the years have been invaluable to our team. 
                          Today, we celebrate your <strong>5-year anniversary</strong> and the positive impact 
                          you've made on our organization.
                          <br /><br />
                          As a token of our appreciation for your continued service, we invite you to select 
                          a special gift. Thank you for being such an important part of our success.
                        </p>
                      </div>

                      {/* Author Signature */}
                      <div className="mt-auto pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-[#D91C81] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
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

                {/* CTA Button */}
                <div className="flex justify-center mt-8">
                  <button className="px-8 py-4 bg-[#D91C81] hover:bg-[#B71569] text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                    <span>Choose Your Gift</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedVariation === 'video' && (
            <div className="min-h-[600px] bg-gradient-to-br from-pink-50 to-blue-50 p-6 md:p-12">
              <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative flex items-center justify-center">
                  <div className="text-center text-white">
                    <Video className="w-20 h-20 mx-auto mb-4 opacity-50" />
                    <p className="text-lg opacity-75">Video Message from CEO</p>
                  </div>
                  <button className="absolute inset-0 flex items-center justify-center group">
                    <div className="w-20 h-20 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm transition-all">
                      <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-1"></div>
                    </div>
                  </button>
                </div>
                <div className="p-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                    A Special Message for You
                  </h1>
                  <p className="text-gray-600 text-center mb-6">
                    Click play to hear from our CEO about your amazing journey with us
                  </p>
                  <div className="flex justify-center">
                    <button className="px-8 py-4 bg-[#D91C81] hover:bg-[#B71569] text-white rounded-xl font-bold text-lg transition-all flex items-center gap-2">
                      <span>Continue to Gifts</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedVariation === 'celebration' && (
            <div className="min-h-[600px]">
              {/* Hero Section - Letter Style */}
              <div 
                className="px-4 py-16 md:py-20"
                style={{
                  background: 'linear-gradient(135deg, rgba(217, 28, 129, 0.08) 0%, rgba(27, 42, 94, 0.08) 100%)'
                }}
              >
                <div className="max-w-6xl mx-auto">
                  {/* Letter Layout - Image + Text Side by Side */}
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-0">
                      {/* Left Side - Leadership Image */}
                      <div className="relative h-[300px] md:h-auto">
                        <img
                          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=800&fit=crop"
                          alt="Leadership"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Right Side - Letter Content */}
                      <div className="p-8 md:p-12 flex flex-col justify-center">
                        <h1 className="text-3xl md:text-4xl font-bold text-[#D91C81] mb-6">
                          Congratulations on Your Anniversary!
                        </h1>

                        <div className="prose prose-lg max-w-none mb-8">
                          <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                            Your dedication and commitment over the years have been invaluable to our team. 
                            Today, we celebrate your contributions and the positive impact you've made on our organization.
                            <br /><br />
                            As a token of our appreciation for your continued service, we invite you to select 
                            a special gift. Thank you for being such an important part of our success.
                          </p>
                        </div>

                        {/* Author Signature */}
                        <div className="mt-auto pt-6 border-t border-gray-200">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-[#D91C81] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
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
                  <h2 className="text-3xl md:text-4xl font-bold text-[#D91C81] mb-4">
                    Messages from Your Team
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Your colleagues have shared their congratulations and appreciation
                  </p>
                </div>

                {/* Card Grid - 3 sample cards showing eCards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {/* Message 1 */}
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer overflow-hidden">
                    {/* eCard Preview */}
                    <div className="p-4">
                      <div 
                        className="w-full h-32 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                        style={{ 
                          background: 'linear-gradient(135deg, #FF6B9D 0%, #FFD93D 100%)'
                        }}
                      >
                        🎊 Congratulations!
                      </div>
                    </div>

                    {/* Message Text */}
                    <div className="px-6 pb-4">
                      <p className="text-gray-700 text-sm leading-relaxed italic mb-4">
                        "Congratulations on your 5 year anniversary! Your dedication and hard work have been instrumental to our team's success. Thank you for everything you do!"
                      </p>

                      {/* Sender Info */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        <div className="w-10 h-10 rounded-full bg-[#D91C81] flex items-center justify-center text-white font-bold text-sm">
                          S
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Sarah Johnson</p>
                          <p className="text-gray-600 text-xs">Manager</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message 2 */}
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer overflow-hidden">
                    {/* eCard Preview */}
                    <div className="p-4">
                      <div 
                        className="w-full h-32 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                        style={{ 
                          background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)'
                        }}
                      >
                        🌟 Well Done!
                      </div>
                    </div>

                    {/* Message Text */}
                    <div className="px-6 pb-4">
                      <p className="text-gray-700 text-sm leading-relaxed italic mb-4">
                        "Happy work anniversary! It's been amazing working alongside you. Here's to many more years of collaboration!"
                      </p>

                      {/* Sender Info */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        <div className="w-10 h-10 rounded-full bg-[#D91C81] flex items-center justify-center text-white font-bold text-sm">
                          M
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Mike Chen</p>
                          <p className="text-gray-600 text-xs">Peer</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message 3 */}
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer overflow-hidden">
                    {/* eCard Preview */}
                    <div className="p-4">
                      <div 
                        className="w-full h-32 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                        style={{ 
                          background: 'linear-gradient(135deg, #00B4CC 0%, #FFD93D 100%)'
                        }}
                      >
                        💙 Thank You!
                      </div>
                    </div>

                    {/* Message Text */}
                    <div className="px-6 pb-4">
                      <p className="text-gray-700 text-sm leading-relaxed italic mb-4">
                        "Thank you for your outstanding contributions over the years. Your commitment to excellence sets a great example for everyone on the team!"
                      </p>

                      {/* Sender Info */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        <div className="w-10 h-10 rounded-full bg-[#D91C81] flex items-center justify-center text-white font-bold text-sm">
                          E
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Emily Rodriguez</p>
                          <p className="text-gray-600 text-xs">Leadership Team</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* View All Link */}
                <div className="text-center">
                  <button className="inline-flex items-center gap-2 text-lg font-semibold text-[#D91C81] hover:gap-3 transition-all">
                    <MessageCircle className="w-5 h-5" />
                    View all messages & add yours
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Bottom Navigation Bar - Dark Blue */}
              <div className="py-6 px-4 shadow-lg bg-[#1B2A5E]">
                <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
                  <div className="text-white">
                    <p className="font-semibold text-lg">Ready to choose your gift?</p>
                    <p className="text-white/80 text-sm">Let's get started with your selection</p>
                  </div>
                  <button
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg bg-[#D91C81] hover:bg-[#B71569] text-white transition-all hover:shadow-lg group"
                    style={{ 
                      boxShadow: '0 4px 14px rgba(217, 28, 129, 0.25)'
                    }}
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedVariation === 'skip' && (
            <div className="min-h-[600px] bg-gray-50 flex items-center justify-center p-6">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ArrowRight className="w-10 h-10 text-gray-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome Page Skipped</h2>
                <p className="text-gray-600 mb-6">
                  When <code className="px-2 py-1 bg-gray-200 rounded text-sm">enableWelcomePage: false</code>, 
                  users go directly from authentication to gift selection.
                </p>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Flow:</strong> Landing → Validation → <strong className="text-[#D91C81]">Gift Selection</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">Configuration Details</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Setting:</span>
              <span className="ml-2 text-gray-600">
                {selectedVariation === 'skip' ? 'enableWelcomePage: false' : 'enableWelcomePage: true'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Layout:</span>
              <span className="ml-2 text-gray-600">
                {selectedVariation === 'letter' && 'Letter (default)'}
                {selectedVariation === 'video' && 'Video embed'}
                {selectedVariation === 'celebration' && 'Celebration integrated'}
                {selectedVariation === 'skip' && 'N/A'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Next Step:</span>
              <span className="ml-2 text-gray-600">Gift Selection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}