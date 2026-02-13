import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, CheckCircle, Package, MapPin, FileText, Home } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import Logo from '../../imports/Logo';

export function FlowDemo() {
  const { t } = useLanguage();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      number: 1,
      title: 'Landing Page',
      description: 'Welcome message and company branding',
      route: '/',
      icon: Home,
      color: 'from-purple-500 to-purple-600'
    },
    {
      number: 2,
      title: 'Access Validation',
      description: 'Email, Employee ID, Serial Card, or Magic Link',
      route: '/access',
      icon: CheckCircle,
      color: 'from-blue-500 to-blue-600'
    },
    {
      number: 3,
      title: 'Gift Selection',
      description: 'Browse available gifts',
      route: '/gift-selection',
      icon: Package,
      color: 'from-pink-500 to-pink-600'
    },
    {
      number: 4,
      title: 'Gift Detail',
      description: 'View features, specifications, and select quantity',
      route: '/gift-detail/gift-1',
      icon: FileText,
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      number: 5,
      title: 'Shipping Information',
      description: 'Enter delivery address',
      route: '/shipping',
      icon: MapPin,
      color: 'from-green-500 to-green-600'
    },
    {
      number: 6,
      title: 'Review & Confirm',
      description: 'Review order and submit',
      route: '/review',
      icon: CheckCircle,
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const toggleStep = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) {
      setCompletedSteps(completedSteps.filter(s => s !== stepNumber));
    } else {
      setCompletedSteps([...completedSteps, stepNumber]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-8 w-[88px]">
                <Logo />
              </div>
              <span className="text-sm font-semibold text-gray-500">Flow Demo</span>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              6-Step Gift Flow Demo
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Complete user journey from landing to order confirmation. Click any step below to navigate through the flow.
            </p>
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Flow Progress</h2>
              <div className="text-sm text-gray-500">
                {completedSteps.length} of {steps.length} steps explored
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
              <div
                className="bg-gradient-to-r from-[#D91C81] to-[#B71569] h-3 rounded-full transition-all duration-500"
                style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
              />
            </div>

            {/* Steps Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {steps.map((step) => {
                const Icon = step.icon;
                const isCompleted = completedSteps.includes(step.number);

                return (
                  <div
                    key={step.number}
                    className={`relative bg-gray-50 rounded-xl p-6 border-2 transition-all hover:shadow-lg ${
                      isCompleted ? 'border-green-500' : 'border-gray-200 hover:border-[#D91C81]'
                    }`}
                  >
                    {/* Completion Checkmark */}
                    {isCompleted && (
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    )}

                    {/* Step Number */}
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${step.color} text-white font-bold text-lg mb-4`}>
                      {step.number}
                    </div>

                    {/* Step Info */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {step.description}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        to={step.route}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
                      >
                        View
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => toggleStep(step.number)}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                          isCompleted
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {isCompleted ? '✓' : '○'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Mock Data</h3>
              <p className="text-sm text-gray-600">
                8 detailed gift products with features, specifications, and realistic data
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Fully i18n</h3>
              <p className="text-sm text-gray-600">
                Complete internationalization support across all 10 languages
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">RecHUB Design</h3>
              <p className="text-sm text-gray-600">
                RecHUB Design System colors and WCAG 2.0 Level AA compliance
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Link
                to="/"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-all"
              >
                <Home className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-900">Landing Page</span>
              </Link>
              <Link
                to="/gift-selection"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg hover:shadow-md transition-all"
              >
                <Package className="w-5 h-5 text-pink-600" />
                <span className="font-semibold text-pink-900">Browse Gifts</span>
              </Link>
              <Link
                to="/language-test"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-all"
              >
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Language Test</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}