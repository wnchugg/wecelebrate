import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, CheckCircle, Package, Truck, Download, Calendar, Mail, MapPin, Gift, Star, Info, ExternalLink, Share2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translateWithParams } from '../../utils/translationHelpers';

export function Step6Confirmation() {
  const [selectedVariation, setSelectedVariation] = useState('standard');
  const { t } = useLanguage();

  const variations = [
    { id: 'standard', label: 'Standard', description: 'Basic order confirmation' },
    { id: 'with-tracking', label: 'With Tracking', description: 'Real-time shipment tracking' },
    { id: 'digital-download', label: 'Digital Download', description: 'Instant digital access' },
    { id: 'multi-gift', label: 'Multi-Gift', description: 'Multiple items in one order' }
  ];

  const orderDetails = {
    orderNumber: 'ORD-2026-0208-1234',
    orderDate: 'February 8, 2026',
    trackingNumber: 'TRK-9876543210',
    estimatedDelivery: 'February 17, 2026'
  };

  const gifts = [
    {
      id: 1,
      name: 'Premium Wireless Headphones',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      price: 299,
      quantity: 1
    },
    {
      id: 2,
      name: 'Designer Backpack',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      price: 180,
      quantity: 1
    },
    {
      id: 3,
      name: 'Amazon Gift Card $100',
      image: 'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=400',
      price: 100,
      quantity: 2
    }
  ];

  const shippingAddress = {
    name: 'Sarah Johnson',
    address: '123 Business Park Drive',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102'
  };

  const trackingSteps = [
    { status: 'Order Placed', date: 'Feb 8, 2:30 PM', completed: true },
    { status: 'Processing', date: 'Feb 9, 10:15 AM', completed: true },
    { status: 'Shipped', date: 'Feb 10, 3:45 PM', completed: true },
    { status: 'In Transit', date: 'Feb 12, 8:00 AM', completed: true },
    { status: 'Out for Delivery', date: 'Feb 17, 9:00 AM', completed: false },
    { status: 'Delivered', date: 'Expected by 5:00 PM', completed: false }
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
              <div className="w-8 h-8 rounded-lg bg-[#00B4CC] text-white flex items-center justify-center font-bold">
                6
              </div>
              <span className="font-semibold text-gray-900">Confirmation</span>
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
                    ? 'border-[#00B4CC] bg-cyan-50 shadow-lg'
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
          {/* Success Header */}
          <div className="bg-gradient-to-r from-[#00B4CC] to-[#D91C81] text-white p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-white/90 text-lg">Thank you for your selection, Sarah!</p>
          </div>

          <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Order Details */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order Number</p>
                    <p className="text-lg font-bold text-gray-900">{orderDetails.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order Date</p>
                    <p className="text-lg font-bold text-gray-900">{orderDetails.orderDate}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm text-gray-600 mb-2">Confirmation sent to:</p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#00B4CC]" />
                    <span className="font-medium text-gray-900">sarah.johnson@acmecorp.com</span>
                  </div>
                </div>
              </div>

              {/* Standard Variation - Order Summary */}
              {selectedVariation === 'standard' && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#D91C81]" />
                    Order Summary
                  </h2>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <img
                        src={gifts[0].image}
                        alt={gifts[0].name}
                        className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{gifts[0].name}</h3>
                        <p className="text-sm text-gray-600 mt-1">Quantity: {gifts[0].quantity}</p>
                        <p className="text-lg font-bold text-[#D91C81] mt-2">${gifts[0].price}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-green-600">
                      <Calendar className="w-5 h-5" />
                      <span className="font-medium">{translateWithParams(t, 'shipping.estimatedDelivery', { date: orderDetails.estimatedDelivery })}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* With Tracking Variation */}
              {selectedVariation === 'with-tracking' && (
                <>
                  <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-[#00B4CC]" />
                        Shipment Tracking
                      </h2>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        In Transit
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-600 mb-1">{translateWithParams(t, 'shipping.trackingNumber', { number: orderDetails.trackingNumber })}</p>
                      <div className="flex items-center justify-between">
                        <button className="text-[#00B4CC] hover:text-[#0095AD] font-medium text-sm flex items-center gap-1">
                          <ExternalLink className="w-4 h-4" />
                          Track
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {trackingSteps.map((step, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                step.completed
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {step.completed ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : (
                                <div className="w-3 h-3 rounded-full border-2 border-current" />
                              )}
                            </div>
                            {index < trackingSteps.length - 1 && (
                              <div
                                className={`w-0.5 h-8 ${
                                  step.completed ? 'bg-green-300' : 'bg-gray-200'
                                }`}
                              />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <p
                              className={`font-semibold ${
                                step.completed ? 'text-gray-900' : 'text-gray-500'
                              }`}
                            >
                              {step.status}
                            </p>
                            <p className="text-sm text-gray-600">{step.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#D91C81]" />
                      Delivery Address
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium text-gray-900">{shippingAddress.name}</p>
                      <p className="text-gray-600">{shippingAddress.address}</p>
                      <p className="text-gray-600">
                        {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Digital Download Variation */}
              {selectedVariation === 'digital-download' && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 p-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#D91C81] to-[#00B4CC] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Download className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Your Digital Gift is Ready!</h2>
                    <p className="text-gray-600">Access your gift instantly below</p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src="https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=400"
                          alt="Digital Gift"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">Amazon Gift Card</h3>
                          <p className="text-sm text-gray-600">$100 Value</p>
                        </div>
                      </div>
                      <button className="w-full py-3 bg-gradient-to-r from-[#D91C81] to-[#00B4CC] hover:shadow-lg text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
                        <Download className="w-5 h-5" />
                        Download Gift Card
                      </button>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Important:</strong> Your gift card code and redemption instructions 
                        have been sent to your email. This page will remain accessible in your order history.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Multi-Gift Variation */}
              {selectedVariation === 'multi-gift' && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-[#D91C81]" />
                    Your Gifts ({gifts.length} items)
                  </h2>
                  <div className="space-y-4">
                    {gifts.map((gift) => (
                      <div
                        key={gift.id}
                        className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <img
                          src={gift.image}
                          alt={gift.name}
                          className="w-20 h-20 rounded-lg object-cover border-2 border-white shadow-sm"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{gift.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">Quantity: {gift.quantity}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="font-bold text-[#D91C81]">${gift.price * gift.quantity}</p>
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                              Confirmed
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-[#D91C81]">
                      ${gifts.reduce((sum, gift) => sum + gift.price * gift.quantity, 0)}
                    </span>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border-2 border-pink-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">What's Next?</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#D91C81] text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email Confirmation</p>
                      <p className="text-sm text-gray-600">
                        Check your inbox for order details and receipt
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#1B2A5E] text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Track Your Order</p>
                      <p className="text-sm text-gray-600">
                        Monitor shipping status in real-time
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#00B4CC] text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Enjoy Your Gift</p>
                      <p className="text-sm text-gray-600">
                        We hope you love your selection!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid sm:grid-cols-3 gap-4">
                <button className="py-3 bg-[#D91C81] hover:bg-[#B71569] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Receipt
                </button>
                <button className="py-3 bg-[#1B2A5E] hover:bg-[#152147] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Package className="w-4 h-4" />
                  View Order History
                </button>
                <button className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>

              {/* Feedback Section */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center">
                <div className="mb-4">
                  <Star className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">How was your experience?</h3>
                  <p className="text-sm text-gray-600">Your feedback helps us improve</p>
                </div>
                <div className="flex gap-2 justify-center mb-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      className="w-12 h-12 rounded-full border-2 border-gray-200 hover:border-[#D91C81] hover:bg-pink-50 transition-colors font-semibold text-gray-700 hover:text-[#D91C81]"
                    >
                      {rating}
                    </button>
                  ))}
                </div>
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
                <li>• Confirmation includes complete order summary and next steps</li>
                <li>• Tracking integration shows real-time shipment status</li>
                <li>• Digital gifts provide instant download access</li>
                <li>• Multi-gift orders display all items with individual status</li>
                <li>• Email confirmation sent automatically with PDF receipt</li>
                <li>• Feedback collection for continuous improvement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
