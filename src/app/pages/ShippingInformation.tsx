import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Building2, ArrowRight, ArrowLeft, MapPin, Package, Globe } from 'lucide-react';
import { companyConfig } from '../data/config';
import { toast } from 'sonner';
import { useOrder } from '../context/OrderContext';
import { countries, getCountryByCode, Country } from '../utils/countries';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import Logo from '../../imports/Logo';

export function ShippingInformation() {
  const navigate = useNavigate();
  const { selectedGift, setShippingAddress } = useOrder();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: companyConfig.defaultCountry || 'US',
    phone: '',
  });
  
  // Get available countries based on site configuration
  const availableCountries = companyConfig.allowedCountries.length 
    ? countries.filter(c => companyConfig.allowedCountries.includes(c.code))
    : countries;
  
  // Get current country details
  const selectedCountry = getCountryByCode(formData.country);

  useEffect(() => {
    if (!selectedGift) {
      navigate('/gift-selection');
    }
  }, [selectedGift, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (companyConfig.shippingMethod === 'company' && companyConfig.companyAddress) {
      // Use company address
      setShippingAddress({
        fullName: formData.fullName,
        ...companyConfig.companyAddress,
        phone: formData.phone,
      });
    } else {
      // Use employee-provided address
      setShippingAddress(formData);
    }
    
    navigate('/review');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isCompanyShipping = companyConfig.shippingMethod === 'company';

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-pink-100 text-[#D91C81] px-4 py-2 rounded-full mb-4">
            <p className="text-sm font-medium">{t('shipping.step')}</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('shipping.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {isCompanyShipping
              ? t('shipping.companyShippingSubtitle')
              : t('shipping.personalShippingSubtitle')}
          </p>
        </div>

        {/* Shipping Method Info */}
        <div className="mb-8 bg-cyan-50 border border-cyan-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            {isCompanyShipping ? (
              <Building2 className="w-6 h-6 text-[#00B4CC] flex-shrink-0 mt-1" />
            ) : (
              <MapPin className="w-6 h-6 text-[#00B4CC] flex-shrink-0 mt-1" />
            )}
            <div>
              <h3 className="font-semibold text-[#1B2A5E] mb-2">
                {isCompanyShipping ? t('shipping.companyDelivery') : t('shipping.directDelivery')}
              </h3>
              <p className="text-sm text-gray-700">
                {isCompanyShipping
                  ? t('shipping.companyDeliveryDesc')
                  : t('shipping.directDeliveryDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-6">
            {/* Full Name - Always required */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('shipping.fullName')} *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                placeholder={t('shipping.enterFullName')}
              />
            </div>

            {/* Phone - Always required */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('shipping.phone')} *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                placeholder="(555) 123-4567"
              />
            </div>

            {/* Company Address Display */}
            {isCompanyShipping && companyConfig.companyAddress && (
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-start gap-3 mb-4">
                  <Package className="w-5 h-5 text-gray-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{t('shipping.deliveryAddress')}</h4>
                    <p className="text-sm text-gray-600">{t('shipping.giftWillBeShipped')}</p>
                  </div>
                </div>
                <div className="pl-8 text-gray-700">
                  <p>{companyConfig.companyAddress.street}</p>
                  <p>
                    {companyConfig.companyAddress.city}, {companyConfig.companyAddress.state}{' '}
                    {companyConfig.companyAddress.zipCode}
                  </p>
                  <p>{companyConfig.companyAddress.country}</p>
                </div>
              </div>
            )}

            {/* Employee Address Form */}
            {!isCompanyShipping && (
              <>
                {/* Country Selection - Show first for better UX */}
                <div>
                  <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {t('shipping.country')} *
                    </div>
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                  >
                    {availableCountries.map((country: Country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              
                <div>
                  <label htmlFor="street" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('shipping.address')} *
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                    placeholder={t('shipping.enterStreet')}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('shipping.city')} *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                      placeholder={selectedCountry?.code === 'GB' ? 'London' : selectedCountry?.code === 'FR' ? 'Paris' : 'San Francisco'}
                    />
                  </div>

                  {selectedCountry?.hasStates && (
                    <div>
                      <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">
                        {selectedCountry?.stateLabel || t('shipping.state')} *
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                        placeholder={selectedCountry?.code === 'CA' ? 'ON' : selectedCountry?.code === 'AU' ? 'NSW' : 'CA'}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="zipCode" className="block text-sm font-semibold text-gray-700 mb-2">
                    {selectedCountry?.postalCodeLabel || t('shipping.zipCode')} *
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                    placeholder={
                      selectedCountry?.code === 'US' ? '94105' :
                      selectedCountry?.code === 'GB' ? 'SW1A 1AA' :
                      selectedCountry?.code === 'CA' ? 'M5H 2N2' :
                      selectedCountry?.code === 'AU' ? '2000' :
                      '12345'
                    }
                  />
                </div>
              </>
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-3 bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white px-10 py-4 rounded-xl font-bold text-lg transition-all hover:gap-4"
              style={{ boxShadow: '0 4px 12px rgba(217, 28, 129, 0.3)' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 6px 16px rgba(217, 28, 129, 0.4)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(217, 28, 129, 0.3)'}
            >
              {t('shipping.continueToReview')}
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}