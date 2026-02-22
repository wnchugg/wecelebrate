import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useCart } from '../context/CartContext';
import { useSite } from '../context/SiteContext';
import { useShippingConfig } from '../context/ShippingConfigContext';
import { Trash2, ArrowLeft, CreditCard, Building2, User, Minus, Plus } from 'lucide-react';
import { PhoneInput } from '../components/ui/phone-input';
import { AddressInput, AddressData } from '../components/ui/address-input';
import { CurrencyDisplay } from '../components/CurrencyDisplay';
import { useLanguage } from '../context/LanguageContext';

export function Checkout() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart, shippingType } = useCart();
  const { currentSite } = useSite();
  const { getConfigBySiteId } = useShippingConfig();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);

  // Get shipping config for current site
  const shippingConfig = currentSite ? getConfigBySiteId(currentSite.id) : undefined;
  const enableAutocomplete = shippingConfig?.addressValidation?.enableAutocomplete !== false; // Default to true

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: shippingType === 'company' ? '' : undefined,
  });

  const [shippingAddress, setShippingAddress] = useState<AddressData>({
    line1: '',
    line2: '',
    line3: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      phone: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const orderId = Math.random().toString(36).substring(2, 9).toUpperCase();
    clearCart();
    setIsProcessing(false);
    void navigate(`/order-confirmation/${orderId}`);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <Link
            to="/products"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const shippingCost = totalPrice > 100 ? 0 : 15;
  const tax = totalPrice * 0.08;
  const finalTotal = totalPrice + shippingCost + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Continue Shopping
      </Link>

      <h1 className="text-4xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <form onSubmit={() => void handleSubmit()} className="space-y-6">
            {/* Shipping Type */}
            {shippingType && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                {shippingType === 'company' ? (
                  <Building2 className="w-6 h-6 text-blue-600" />
                ) : (
                  <User className="w-6 h-6 text-blue-600" />
                )}
                <div>
                  <p className="font-semibold text-gray-900">
                    Shipping to: <span className="capitalize">{shippingType}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    {shippingType === 'company'
                      ? 'All items will be delivered to your company address'
                      : 'Items will be shipped to individual employee addresses'}
                  </p>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <PhoneInput
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    defaultCountry="US"
                    placeholder={t('form.enterPhone')}
                    required
                  />
                </div>
                {shippingType === 'company' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      required
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
              <AddressInput
                value={shippingAddress}
                onChange={setShippingAddress}
                defaultCountry="US"
                required={true}
                enableAutocomplete={enableAutocomplete}
              />
            </div>

            {/* Payment (Mock) */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                Payment Information
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                This is a demo checkout. No actual payment will be processed.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  Payment will be processed through your company's billing system.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : (
                <>
                  Place Order - <CurrencyDisplay amount={finalTotal} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-20">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-600"><CurrencyDisplay amount={item.price} /></p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 ml-auto hover:bg-red-50 rounded text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span><CurrencyDisplay amount={totalPrice} /></span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'FREE' : <CurrencyDisplay amount={shippingCost} />}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax (8%)</span>
                <span><CurrencyDisplay amount={tax} /></span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg text-gray-900">
                <span>Total</span>
                <span><CurrencyDisplay amount={finalTotal} /></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}