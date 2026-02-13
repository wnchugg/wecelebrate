import { Link } from 'react-router';
import { Building2, Award, Gift, Users, ArrowRight, CheckCircle, Heart, Sparkles } from 'lucide-react';

export default function GlobalHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D91C81]/10 via-transparent to-[#1B2A5E]/10 pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-[#D91C81]/20">
              <Sparkles className="w-5 h-5 text-[#D91C81]" />
              <span className="text-sm font-medium text-gray-700">The Modern Recognition Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Celebrate Every
              <span className="block text-[#D91C81] mt-2">Milestone Together</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              wecelebrate is your complete corporate gifting and employee recognition platform, 
              designed to celebrate achievements and strengthen connections.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/admin/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#D91C81] text-white rounded-lg font-semibold text-lg hover:bg-[#B71569] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Admin Portal
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/client-portal"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#D91C81] border-2 border-[#D91C81] rounded-lg font-semibold text-lg hover:bg-[#D91C81] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Client Portal
                <Building2 className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Purposes Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Two Core Purposes, One Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive solutions for corporate events and employee milestones
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Event Gifting */}
            <div className="bg-gradient-to-br from-[#D91C81]/5 to-[#D91C81]/10 rounded-2xl p-8 border-2 border-[#D91C81]/20 hover:border-[#D91C81] transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-[#D91C81] rounded-2xl flex items-center justify-center mb-6">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Event Gifting</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Celebrate corporate events, holidays, and special occasions with curated gift selections. 
                Perfect for team celebrations, client appreciation, and milestone events.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#D91C81] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Curated gift collections</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#D91C81] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Bulk or individual delivery</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#D91C81] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Custom branding options</span>
                </li>
              </ul>
            </div>

            {/* Service Awards */}
            <div className="bg-gradient-to-br from-[#1B2A5E]/5 to-[#1B2A5E]/10 rounded-2xl p-8 border-2 border-[#1B2A5E]/20 hover:border-[#1B2A5E] transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-[#1B2A5E] rounded-2xl flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Service Award Recognition</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Honor employee loyalty and dedication with meaningful service anniversary gifts. 
                Automated tracking ensures no milestone goes uncelebrated.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#1B2A5E] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Automated anniversary tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#1B2A5E] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Milestone-based gift tiers</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#1B2A5E] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Personalized recognition</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features for Every Organization
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage corporate gifting and recognition at scale
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Multi-Client & Multi-Site */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-[#D91C81]/10 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-[#D91C81]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Client Architecture</h3>
              <p className="text-gray-600">
                Hierarchical structure with Clients at the top level and multiple Sites underneath. 
                Perfect for organizations with multiple locations or divisions.
              </p>
            </div>

            {/* Validation Methods */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-[#D91C81]/10 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-[#D91C81]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible Validation</h3>
              <p className="text-gray-600">
                Configurable validation methods including serial codes, magic links, and SSO integration. 
                Secure access tailored to your needs.
              </p>
            </div>

            {/* Employee Management */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-[#D91C81]/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-[#D91C81]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Employee Management</h3>
              <p className="text-gray-600">
                Complete employee data management with ERP integration support. 
                Track anniversaries, eligibility, and gifting history effortlessly.
              </p>
            </div>

            {/* Branded Experience */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-[#1B2A5E]/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-[#1B2A5E]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Custom Branding</h3>
              <p className="text-gray-600">
                White-label capabilities with custom logos, colors, and messaging. 
                Create a branded experience that reflects your organization.
              </p>
            </div>

            {/* Analytics & Reporting */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-[#1B2A5E]/10 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-[#1B2A5E]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics & Insights</h3>
              <p className="text-gray-600">
                Comprehensive reporting and analytics to track program performance, 
                engagement rates, and ROI across all sites.
              </p>
            </div>

            {/* Celebrations Module */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-[#1B2A5E]/10 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-[#1B2A5E]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Celebrations Module</h3>
              <p className="text-gray-600">
                Share recognition messages with e-cards and video support. 
                Foster a culture of appreciation across your organization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#D91C81] to-[#B71569] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Recognition Program?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join leading organizations using wecelebrate to celebrate their people
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#D91C81] rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">wecelebrate</h3>
              <p className="text-gray-400">
                Modern corporate gifting and employee recognition platform
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/admin/login" className="text-gray-400 hover:text-white transition-colors">
                    Admin Portal
                  </Link>
                </li>
                <li>
                  <Link to="/client-portal" className="text-gray-400 hover:text-white transition-colors">
                    Client Portal
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} wecelebrate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}