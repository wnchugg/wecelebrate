import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useCart } from '../context/CartContext';
import { Building2, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function SelectShipping() {
  const { setShippingType } = useCart();
  const { userIdentifier } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4">
            <p className="text-sm font-medium">Verified: {userIdentifier}</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Delivery Option
          </h1>
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
    </div>
  );
}