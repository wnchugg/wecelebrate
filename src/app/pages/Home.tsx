import { useState } from 'react';
import { Building2, User, Gift, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router';

export function Home() {
  const { setShippingType } = useCart();

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Gift className="w-5 h-5" />
            <span className="text-sm font-medium">Premium Event Gifting Platform</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Celebrate Every Milestone
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Choose from our curated selection of premium gifts for your employees or corporate events
          </p>
        </div>
      </section>

      {/* Shipping Options */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Delivery Option
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select how you'd like to receive your gifts - shipped directly to your company or to individual employees
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Ship to Company */}
            <Link
              to="/products"
              onClick={() => setShippingType('company')}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-600"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                  <Building2 className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Ship to Company
                </h3>
                <p className="text-gray-600 mb-6">
                  Have all gifts delivered to your company address for bulk distribution. Ideal for corporate events and team celebrations.
                </p>
                <div className="mt-auto flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-4 transition-all">
                  Browse Catalog
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>

            {/* Ship to Employee */}
            <Link
              to="/products"
              onClick={() => setShippingType('employee')}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-600"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                  <User className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Ship to Employee
                </h3>
                <p className="text-gray-600 mb-6">
                  Send gifts directly to individual employee addresses. Perfect for remote teams and personalized recognition.
                </p>
                <div className="mt-auto flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-4 transition-all">
                  Browse Catalog
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-xl mb-2">Premium Selection</h3>
              <p className="text-gray-600">Curated gifts from top brands to celebrate your team</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-xl mb-2">Flexible Delivery</h3>
              <p className="text-gray-600">Choose company or individual shipping options</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-xl mb-2">Easy Process</h3>
              <p className="text-gray-600">Simple checkout and tracking for all orders</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}