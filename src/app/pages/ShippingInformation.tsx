import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, ArrowRight, MapPin, Package, Globe } from 'lucide-react';
import { companyConfig } from '../data/config';
import { useOrder } from '../context/OrderContext';
import { usePublicSite } from '../context/PublicSiteContext';
import { countries, getCountryByCode, Country } from '../utils/countries';
import { useLanguage } from '../context/LanguageContext';
import { AddressAutocomplete, AddressData } from '../components/ui/address-autocomplete';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  shippingSchema,
  companyShippingSchema,
  type ShippingFormValues,
  type CompanyShippingFormValues,
} from '../schemas/shipping.schema';

export function ShippingInformation() {
  const navigate = useNavigate();
  const { selectedGift, setShippingAddress } = useOrder();
  const { currentSite } = usePublicSite();
  const { t } = useLanguage();
  
  // Determine if using company shipping
  const isCompanyShipping = companyConfig.shippingMethod === 'company';
  
  // Get available countries based on site configuration
  const availableCountries = companyConfig.allowedCountries.length 
    ? countries.filter(c => companyConfig.allowedCountries.includes(c.code))
    : countries;
  
  // Initialize form with appropriate schema
  const form = useForm<ShippingFormValues | CompanyShippingFormValues>({
    resolver: zodResolver((isCompanyShipping ? companyShippingSchema : shippingSchema) as any),
    defaultValues: isCompanyShipping
      ? {
          fullName: '',
          phone: '',
        }
      : {
          fullName: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: companyConfig.defaultCountry || 'US',
        },
  });
  
  // Get current country details for employee shipping
  const selectedCountry = !isCompanyShipping 
    ? getCountryByCode(form.watch('country') as string)
    : null;

  // Handle address autocomplete selection — auto-fills all address fields
  const handleAddressSelect = (address: AddressData) => {
    if (!isCompanyShipping) {
      form.setValue('street', address.line1);
      if (address.city) form.setValue('city', address.city);
      if (address.state) form.setValue('state', address.state);
      if (address.postalCode) form.setValue('zipCode', address.postalCode);
      if (address.country && availableCountries.some(c => c.code === address.country)) {
        form.setValue('country', address.country);
      }
    }
  };

  useEffect(() => {
    if (!selectedGift) {
      void navigate('../gift-selection');
    }
  }, [selectedGift, navigate]);

  const onSubmit = (data: ShippingFormValues | CompanyShippingFormValues) => {
    if (isCompanyShipping && companyConfig.companyAddress) {
      // Use company address
      setShippingAddress({
        fullName: data.fullName,
        ...companyConfig.companyAddress,
        phone: data.phone,
      });
    } else {
      // Use employee-provided address
      setShippingAddress(data as ShippingFormValues);
    }
    
    // Check if review page should be skipped
    const skipReview = currentSite?.settings?.skipReviewPage ?? false;
    
    if (skipReview) {
      // Skip review page and go directly to confirmation
      void navigate('../confirmation');
    } else {
      // Go to review page
      void navigate('../review-order');
    }
  };

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-lg p-8">
            <div className="space-y-6">
              {/* Full Name - Always required */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('shipping.fullName')} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('shipping.enterFullName')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone - Always required */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('shipping.phone')} *</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="(555) 123-4567"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          {t('shipping.country')} *
                        </div>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('shipping.selectCountry')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableCountries.map((country: Country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('shipping.address')} *</FormLabel>
                      <FormControl>
                        <AddressAutocomplete
                          id="shipping-address-line1"
                          onSelect={handleAddressSelect}
                          onChange={field.onChange}
                          country={form.watch('country') as string}
                          placeholder={t('shipping.enterStreet')}
                          inputClassName="h-auto py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('shipping.city')} *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={selectedCountry?.code === 'GB' ? 'London' : selectedCountry?.code === 'FR' ? 'Paris' : 'San Francisco'}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedCountry?.hasStates && (
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{selectedCountry?.stateLabel || t('shipping.state')} *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={selectedCountry?.code === 'CA' ? 'ON' : selectedCountry?.code === 'AU' ? 'NSW' : 'CA'}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{selectedCountry?.postalCodeLabel || t('shipping.zipCode')} *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            selectedCountry?.code === 'US' ? '94105' :
                            selectedCountry?.code === 'GB' ? 'SW1A 1AA' :
                            selectedCountry?.code === 'CA' ? 'M5H 2N2' :
                            selectedCountry?.code === 'AU' ? '2000' :
                            '12345'
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting}
              className="gap-3"
            >
              {form.formState.isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('common.processing')}
                </>
              ) : (
                <>
                  {t('shipping.continueToReview')}
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
      </div>
    </div>
  );
}