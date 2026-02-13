import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Truck, MapPin, Package, Store, Download, Calendar, Info, Edit, CheckCircle } from 'lucide-react';

export function Step5ShippingReview() {
  const [selectedVariation, setSelectedVariation] = useState('company-ship');
  const [editingAddress, setEditingAddress] = useState(false);

  const variations = [
    { id: 'company-ship', label: 'Company Ship', description: 'Ship to company-provided address' },
    { id: 'self-ship', label: 'Self Ship', description: 'Employee enters own shipping address' },
    { id: 'store-pickup', label: 'Store Pickup', description: 'Pick up from local store' },
    { id: 'digital-only', label: 'Digital Only', description: 'No shipping needed for digital gifts' }
  ];

  const selectedGift = {
    name: 'Premium Wireless Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    price: 299,
    points: 2990
  };

  const companyAddress = {
    name: 'Sarah Johnson',
    company: 'Acme Corporation',
    address: '123 Business Park Drive',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
    country: 'United States'
  };

  const pickupLocations = [
    { id: 1, name: 'Downtown Store', address: '456 Market Street, San Francisco, CA 94102', distance: '2.3 miles', hours: 'Mon-Fri 9am-6pm' },
    { id: 2, name: 'Marina District', address: '789 Chestnut Street, San Francisco, CA 94123', distance: '4.1 miles', hours: 'Mon-Sat 10am-7pm' },
    { id: 3, name: 'Mission Bay', address: '321 Berry Street, San Francisco, CA 94158', distance: '3.5 miles', hours: 'Mon-Sun 9am-8pm' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/demos"
              className="flex items-center gap-2 text-gray-600 hover:text-[#D91C81] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to All Steps</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1B2A5E] text-white flex items-center justify-center font-bold">
                5
              </div>
              <span className="font-semibold text-gray-900">Shipping & Review</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Variation Selector */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select Variation</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {variations.map((variation) => (
              <button
                key={variation.id}
                onClick={() => setSelectedVariation(variation.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedVariation === variation.id
                    ? 'border-[#1B2A5E] bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-gray-900 mb-1">{variation.label}</p>
                <p className="text-sm text-gray-600">{variation.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Demo Preview */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#1B2A5E] to-[#00B4CC] text-white p-6">
            <div className="flex items-center gap-3 mb-2">
              <Truck className="w-8 h-8" />
              <h1 className="text-2xl md:text-3xl font-bold">Shipping & Review</h1>
            </div>
            <p className="text-white/90">Confirm your delivery details</p>
          </div>

          <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Order Summary */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#D91C81]" />
                  Order Summary
                </h2>
                <div className="flex gap-4">
                  <img
                    src={selectedGift.image}
                    alt={selectedGift.name}
                    className="w-24 h-24 rounded-lg object-cover border-2 border-white shadow-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{selectedGift.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">Quantity: 1</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-[#D91C81]">${selectedGift.price}</span>
                      <span className="text-sm text-gray-500">or {selectedGift.points} points</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Ship Variation */}
              {selectedVariation === 'company-ship' && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#1B2A5E]" />
                      Shipping Address
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="font-semibold text-gray-900">{companyAddress.name}</p>
                    <p className="text-gray-600">{companyAddress.company}</p>
                    <p className="text-gray-600">{companyAddress.address}</p>
                    <p className="text-gray-600">
                      {companyAddress.city}, {companyAddress.state} {companyAddress.zip}
                    </p>
                    <p className="text-gray-600">{companyAddress.country}</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-3 italic">
                    This address is pre-configured by your company and cannot be changed.
                  </p>
                </div>
              )}

              {/* Self Ship Variation */}
              {selectedVariation === 'self-ship' && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#1B2A5E]" />
                      Shipping Address
                    </h2>
                    {!editingAddress && (
                      <button
                        onClick={() => setEditingAddress(true)}
                        className="flex items-center gap-2 text-[#D91C81] hover:text-[#B71569] font-medium text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                  </div>
                  
                  {editingAddress ? (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                          <input
                            type="text"
                            defaultValue="Sarah"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2A5E] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                          <input
                            type="text"
                            defaultValue="Johnson"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2A5E] focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                        <input
                          type="text"
                          defaultValue="789 Residential Lane"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2A5E] focus:border-transparent"
                        />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            defaultValue="San Francisco"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2A5E] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                          <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2A5E] focus:border-transparent">
                            <option>CA</option>
                            <option>NY</option>
                            <option>TX</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                          <input
                            type="text"
                            defaultValue="94102"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2A5E] focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setEditingAddress(false)}
                          className="flex-1 py-2.5 bg-[#1B2A5E] hover:bg-[#152147] text-white rounded-lg font-medium transition-colors"
                        >
                          Save Address
                        </button>
                        <button
                          onClick={() => setEditingAddress(false)}
                          className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="font-semibold text-gray-900">Sarah Johnson</p>
                      <p className="text-gray-600">789 Residential Lane</p>
                      <p className="text-gray-600">San Francisco, CA 94102</p>
                      <p className="text-gray-600">United States</p>
                    </div>
                  )}
                </div>
              )}

              {/* Store Pickup Variation */}
              {selectedVariation === 'store-pickup' && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Store className="w-5 h-5 text-[#1B2A5E]" />
                    Choose Pickup Location
                  </h2>
                  <div className="space-y-3">
                    {pickupLocations.map((location, index) => (
                      <label
                        key={location.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          index === 0
                            ? 'border-[#1B2A5E] bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="pickup-location"
                          defaultChecked={index === 0}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{location.name}</p>
                          <p className="text-sm text-gray-600 mt-1">{location.address}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-[#D91C81] font-medium">{location.distance}</span>
                            <span className="text-sm text-gray-500">{location.hours}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Pickup Instructions:</strong> Please bring a valid ID when picking up your order. 
                      You'll receive an email notification when your order is ready for pickup.
                    </p>
                  </div>
                </div>
              )}

              {/* Digital Only Variation */}
              {selectedVariation === 'digital-only' && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5 text-[#1B2A5E]" />
                    Digital Delivery
                  </h2>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#00B4CC] rounded-full flex items-center justify-center flex-shrink-0">
                        <Download className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Instant Digital Access</h3>
                        <p className="text-gray-600 mb-3">
                          Your digital gift will be delivered instantly to your email address:
                        </p>
                        <p className="font-medium text-gray-900 bg-white px-4 py-2 rounded-lg inline-block">
                          sarah.johnson@acmecorp.com
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm text-gray-700">Send a copy to my alternate email</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Delivery Date */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#1B2A5E]" />
                  Expected Delivery
                </h2>
                <div className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedVariation === 'digital-only' ? 'Instant Delivery' : 'Monday, February 17, 2026'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedVariation === 'digital-only' 
                        ? 'Available immediately after confirmation'
                        : 'Standard shipping (5-7 business days)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button className="flex-1 py-4 bg-[#1B2A5E] hover:bg-[#152147] text-white rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl">
                  Confirm Order
                </button>
                <button className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors">
                  Back to Selection
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Implementation Notes</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Shipping method is configured per site in the admin panel</li>
                <li>• Address validation ensures accuracy for physical shipments</li>
                <li>• Store pickup includes location search and hours display</li>
                <li>• Digital delivery is instant with email confirmation</li>
                <li>• Order summary shows complete details before final confirmation</li>
                <li>• Responsive design optimized for mobile checkout</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
