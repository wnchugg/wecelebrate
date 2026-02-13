import { Link, Outlet, useLocation } from 'react-router';
import { 
  Home, 
  Shield, 
  PartyPopper, 
  Gift, 
  Truck, 
  CheckCircle,
  ArrowRight,
  Monitor,
  Smartphone,
  Globe
} from 'lucide-react';

export function FlowDemosHub() {
  const location = useLocation();
  const isChildRoute = location.pathname !== '/demos';
  
  // If we're on a child route, just render the Outlet
  if (isChildRoute) {
    return <Outlet />;
  }
  
  const steps = [
    {
      number: 1,
      title: 'Landing Page',
      path: '/demos/step1',
      icon: Home,
      color: '#D91C81',
      description: 'Branded welcome experience',
      variations: ['Standard', 'Skip to Auth', 'Multi-Site Selection']
    },
    {
      number: 2,
      title: 'Access Validation',
      path: '/demos/step2',
      icon: Shield,
      color: '#1B2A5E',
      description: 'User authentication',
      variations: ['Email', 'Employee ID', 'Serial Card', 'Magic Link', 'SSO']
    },
    {
      number: 3,
      title: 'Welcome Message',
      path: '/demos/step3',
      icon: PartyPopper,
      color: '#00B4CC',
      description: 'Personalized greeting',
      variations: ['Letter Layout', 'Video Message', 'With Celebration', 'Skip Welcome']
    },
    {
      number: 4,
      title: 'Gift Selection',
      path: '/demos/step4',
      icon: Gift,
      color: '#D91C81',
      description: 'Browse and choose gifts',
      variations: ['Grid View', 'Category Filter', 'With Pricing', 'Without Pricing']
    },
    {
      number: 5,
      title: 'Shipping & Review',
      path: '/demos/step5',
      icon: Truck,
      color: '#1B2A5E',
      description: 'Delivery information',
      variations: ['Company Ship', 'Self Ship', 'Store Pickup', 'Digital Only']
    },
    {
      number: 6,
      title: 'Confirmation',
      path: '/demos/step6',
      icon: CheckCircle,
      color: '#00B4CC',
      description: 'Order complete',
      variations: ['Standard', 'With Tracking', 'Digital Download', 'Multi-Gift']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">6-Step Flow Demos</h1>
              <p className="text-gray-600 mt-1">Interactive previews of each step with site variations</p>
            </div>
            <Link
              to="/feature-preview"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            >
              Back to Feature Preview
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-[#D91C81] via-[#1B2A5E] to-[#00B4CC] rounded-3xl p-8 md:p-12 text-white mb-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Monitor className="w-8 h-8" />
              <Smartphone className="w-6 h-6" />
              <Globe className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Explore Every Step of the User Journey
            </h2>
            <p className="text-white/90 text-lg">
              See how different site configurations affect the user experience. Each step includes 
              multiple variations showing different validation methods, branding options, and feature combinations.
            </p>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <Link
                key={step.number}
                to={step.path}
                className="group bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-[#D91C81] hover:shadow-xl transition-all"
              >
                {/* Step Number */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.number}
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#D91C81] group-hover:translate-x-1 transition-all" />
                </div>

                {/* Icon & Title */}
                <div className="mb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <IconComponent className="w-6 h-6" style={{ color: step.color }} />
                    <h3 className="font-bold text-gray-900 text-lg">{step.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>

                {/* Variations */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {step.variations.length} Variations
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {step.variations.map((variation, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                      >
                        {variation}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Monitor className="w-5 h-5 text-[#D91C81]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Fully Interactive</h3>
            <p className="text-sm text-gray-600">
              All demos are fully functional with real UI interactions and navigation
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Smartphone className="w-5 h-5 text-[#1B2A5E]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Responsive Design</h3>
            <p className="text-sm text-gray-600">
              All variations work perfectly on desktop, tablet, and mobile devices
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-5 h-5 text-[#00B4CC]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Multiple Configurations</h3>
            <p className="text-sm text-gray-600">
              See how different settings and features affect the user experience
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}