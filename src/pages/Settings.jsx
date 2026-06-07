import { useState, useEffect } from 'react';
import {
  CogIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  QrCodeIcon,
  BanknotesIcon,
  TruckIcon,
  ScaleIcon,
  TrophyIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { apiCall } from '../utils/api';
import { useAuthStore } from '../store/authStore';

const Settings = () => {
  const [settings, setSettings] = useState({
    payment: {
      razorpay: { enabled: true, keyId: '', keySecret: '' },
      stripe: { enabled: false, publicKey: '', secretKey: '' },
      cod: { enabled: true, minimumAmount: 0, maximumAmount: 5000 },
      qr: { enabled: false, upiId: 'silaimart@paytm', merchantName: 'SilaiMart' }
    },
    site: {
      store: {
        sizeGuideImage: '',
        customPincodes: []
      }
    },
    shipping: {
      freeShippingThreshold: 1000,
      standardShipping: 50,
      expressShipping: 150,
      estimatedDelivery: {
        standard: '5-7 business days',
        express: '2-3 business days'
      }
    },
    tax: {
      enabled: true,
      rate: 18
    },
    loyalty: {
      enabled: true,
      pointsPerRupee: 0.1,
      minimumRedeemPoints: 100,
      redemptionRate: 1
    },
    offers: {
      wowDeal: { enabled: true, title: 'WOW! DEAL Apply offers for maximum savings', discountPercentage: 15, minOrderValue: 500 },
      superCoin: { enabled: true, benefitTitle: 'SuperCoin Benefit', pointsDiscount: 12, coinsRequired: 12 },
      bankOffers: [
        { id: 'bank-1', title: 'Bank Offer', description: '5% Cashback on Flipkart Axis Bank Card', code: 'AXIS5', discountPercent: 5 },
        { id: 'bank-2', title: 'Special Offer', description: '10% off on ICICI Bank Credit Cards, up to ₹100', code: 'ICICI10', discountPercent: 10 }
      ]
    }
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'superadmin';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await apiCall('/admin/settings');
      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isSuperAdmin) {
      toast.error('Only Super Admins can update settings');
      return;
    }
    try {
      await apiCall('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleFieldChange = (section, field, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [section]: {
        ...prevSettings[section],
        [field]: value
      }
    }));
  };

  const handleNestedFieldChange = (section, parentField, field, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [section]: {
        ...prevSettings[section],
        [parentField]: {
          ...prevSettings[section][parentField],
          [field]: value
        }
      }
    }));
  };

  const handleBankOfferChange = (index, field, value) => {
    setSettings(prev => {
      const updatedBankOffers = [...(prev.offers?.bankOffers || [])];
      updatedBankOffers[index] = { ...updatedBankOffers[index], [field]: value };
      return {
        ...prev,
        offers: {
          ...prev.offers,
          bankOffers: updatedBankOffers
        }
      };
    });
  };

  const handleAddBankOffer = () => {
    setSettings(prev => ({
      ...prev,
      offers: {
        ...prev.offers,
        bankOffers: [...(prev.offers?.bankOffers || []), { id: `bank-${Date.now()}`, title: '', description: '', code: '', discountPercent: 0 }]
      }
    }));
  };

  const handleRemoveBankOffer = (index) => {
    setSettings(prev => {
      const updated = [...(prev.offers?.bankOffers || [])];
      updated.splice(index, 1);
      return {
        ...prev,
        offers: {
          ...prev.offers,
          bankOffers: updated
        }
      };
    });
  };

  const handleAddCustomPincode = () => {
    setSettings(prev => ({
      ...prev,
      site: {
        ...prev.site,
        store: {
          ...prev.site?.store,
          customPincodes: [...(prev.site?.store?.customPincodes || []), { pincode: '', deliveryDays: 5, codAvailable: true, freeDelivery: false }]
        }
      }
    }));
  };

  const handleCustomPincodeChange = (index, field, value) => {
    setSettings(prev => {
      const updated = [...(prev.site?.store?.customPincodes || [])];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        site: {
          ...prev.site,
          store: {
            ...prev.site?.store,
            customPincodes: updated
          }
        }
      };
    });
  };

  const handleRemoveCustomPincode = (index) => {
    setSettings(prev => {
      const updated = [...(prev.site?.store?.customPincodes || [])];
      updated.splice(index, 1);
      return {
        ...prev,
        site: {
          ...prev.site,
          store: {
            ...prev.site?.store,
            customPincodes: updated
          }
        }
      };
    });
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Platform Settings</h1>
          <p className="text-gray-500 font-medium mt-1">Configure your store's core parameters and integrations</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={handleSave}
            className="bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 active:scale-[0.98] flex items-center gap-2"
          >
            <CheckIcon className="h-5 w-5 stroke-[3px]" />
            Save Configuration
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Store Settings */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <ScaleIcon className="h-24 w-24 text-primary-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8 relative z-10">Store Configuration</h2>

          <div className="space-y-6">
            <div className="bg-stone-50/50 rounded-3xl p-8 border border-gray-100 transition-all hover:bg-white hover:shadow-md">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-50">
                    <ScaleIcon className="h-8 w-8 text-primary-500" />
                  </div>
                  <div>
                    <span className="font-black text-gray-900 block tracking-tight">Size Guide Image</span>
                    <span className="text-gray-500 text-xs font-medium">Global size chart shown on product pages</span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Image URL</label>
                <input
                  type="text"
                  value={settings.site?.store?.sizeGuideImage || ''}
                  onChange={(e) => handleNestedFieldChange('site', 'store', { ...settings.site?.store, sizeGuideImage: e.target.value })}
                  className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300"
                  placeholder="https://example.com/size-guide.jpg"
                  disabled={!isSuperAdmin}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <CreditCardIcon className="h-24 w-24 text-primary-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8 relative z-10">Payment Gateway Integrations</h2>

          <div className="space-y-6">
            {/* Razorpay */}
            <div className="bg-stone-50/50 rounded-3xl p-8 border border-gray-100 transition-all hover:bg-white hover:shadow-md">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-50">
                    <img src="https://razorpay.com/favicon.png" className="w-8 h-8 object-contain" alt="Razorpay" />
                  </div>
                  <div>
                    <span className="font-black text-gray-900 block tracking-tight">Razorpay Business</span>
                    <span className="text-gray-500 text-xs font-medium">Domestic Payments (India)</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.payment.razorpay.enabled}
                    onChange={(e) => handleNestedFieldChange('payment', 'razorpay', 'enabled', e.target.checked)}
                    className="sr-only peer"
                    disabled={!isSuperAdmin}
                  />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600 shadow-inner"></div>
                </label>
              </div>

              {settings.payment.razorpay.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50 mt-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Gateway Key ID</label>
                    <input
                      type="text"
                      value={settings.payment.razorpay.keyId}
                      onChange={(e) => handleNestedFieldChange('payment', 'razorpay', 'keyId', e.target.value)}
                      className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300"
                      placeholder="rzp_live_..."
                      disabled={!isSuperAdmin}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Gateway Secret</label>
                    <input
                      type="password"
                      value={settings.payment.razorpay.keySecret}
                      onChange={(e) => handleNestedFieldChange('payment', 'razorpay', 'keySecret', e.target.value)}
                      className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300"
                      placeholder="••••••••••••••••"
                      disabled={!isSuperAdmin}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Stripe */}
            <div className="bg-stone-50/50 rounded-3xl p-8 border border-gray-100 transition-all hover:bg-white hover:shadow-md">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-50">
                    <ShieldCheckIcon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div>
                    <span className="font-black text-gray-900 block tracking-tight">Stripe Payments</span>
                    <span className="text-gray-500 text-xs font-medium">International Credit Cards</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.payment.stripe.enabled}
                    onChange={(e) => handleNestedFieldChange('payment', 'stripe', 'enabled', e.target.checked)}
                    className="sr-only peer"
                    disabled={!isSuperAdmin}
                  />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600 shadow-inner"></div>
                </label>
              </div>

              {settings.payment.stripe.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50 mt-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Publishable Key</label>
                    <input
                      type="text"
                      value={settings.payment.stripe.publicKey}
                      onChange={(e) => handleNestedFieldChange('payment', 'stripe', 'publicKey', e.target.value)}
                      className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                      placeholder="pk_live_..."
                      disabled={!isSuperAdmin}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Secret Access Key</label>
                    <input
                      type="password"
                      value={settings.payment.stripe.secretKey}
                      onChange={(e) => handleNestedFieldChange('payment', 'stripe', 'secretKey', e.target.value)}
                      className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                      placeholder="sk_live_..."
                      disabled={!isSuperAdmin}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* QR Code Payment */}
            {/* QR Code Payment */}
            <div className="bg-stone-50/50 rounded-3xl p-8 border border-gray-100 transition-all hover:bg-white hover:shadow-md">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-50">
                    <QrCodeIcon className="h-8 w-8 text-primary-500" />
                  </div>
                  <div>
                    <span className="font-black text-gray-900 block tracking-tight">VPA / QR Direct</span>
                    <span className="text-gray-500 text-xs font-medium">Direct UPI Settlement</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.payment.qr.enabled}
                    onChange={(e) => handleNestedFieldChange('payment', 'qr', 'enabled', e.target.checked)}
                    className="sr-only peer"
                    disabled={!isSuperAdmin}
                  />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600 shadow-inner"></div>
                </label>
              </div>

              {settings.payment.qr.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50 mt-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Target VPA (UPI ID)</label>
                    <input
                      type="text"
                      value={settings.payment.qr.upiId}
                      onChange={(e) => handleNestedFieldChange('payment', 'qr', 'upiId', e.target.value)}
                      className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300"
                      placeholder="merchant@banksuffix"
                      disabled={!isSuperAdmin}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Verified Display Name</label>
                    <input
                      type="text"
                      value={settings.payment.qr.merchantName}
                      onChange={(e) => handleNestedFieldChange('payment', 'qr', 'merchantName', e.target.value)}
                      className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300"
                      placeholder="SilaiMart Official"
                      disabled={!isSuperAdmin}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cash on Delivery */}
            {/* Cash on Delivery */}
            <div className="bg-stone-50/50 rounded-3xl p-8 border border-gray-100 transition-all hover:bg-white hover:shadow-md">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-50">
                    <BanknotesIcon className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <span className="font-black text-gray-900 block tracking-tight">Offline Payment</span>
                    <span className="text-gray-500 text-xs font-medium">Cash on Delivery Settlement</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.payment.cod.enabled}
                    onChange={(e) => handleNestedFieldChange('payment', 'cod', 'enabled', e.target.checked)}
                    className="sr-only peer"
                    disabled={!isSuperAdmin}
                  />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600 shadow-inner"></div>
                </label>
              </div>

              {settings.payment.cod.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50 mt-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Min Order Required (₹)</label>
                    <input
                      type="number"
                      value={settings.payment.cod.minimumAmount}
                      onChange={(e) => handleNestedFieldChange('payment', 'cod', 'minimumAmount', parseInt(e.target.value))}
                      className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                      disabled={!isSuperAdmin}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Max Ceiling (₹)</label>
                    <input
                      type="number"
                      value={settings.payment.cod.maximumAmount}
                      onChange={(e) => handleNestedFieldChange('payment', 'cod', 'maximumAmount', parseInt(e.target.value))}
                      className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                      disabled={!isSuperAdmin}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Settings */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <TruckIcon className="h-24 w-24 text-rose-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8">Logistics & Fulfilment</h2>

          <div className="bg-stone-50/50 rounded-3xl p-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Free Shipping Min (₹)</label>
                <input
                  type="number"
                  value={settings.shipping.freeShippingThreshold}
                  onChange={(e) => handleFieldChange('shipping', 'freeShippingThreshold', parseInt(e.target.value))}
                  className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                  disabled={!isSuperAdmin}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Standard Base Rate (₹)</label>
                <input
                  type="number"
                  value={settings.shipping.standardShipping}
                  onChange={(e) => handleFieldChange('shipping', 'standardShipping', parseInt(e.target.value))}
                  className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                  disabled={!isSuperAdmin}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Express Surcharge (₹)</label>
                <input
                  type="number"
                  value={settings.shipping.expressShipping}
                  onChange={(e) => handleFieldChange('shipping', 'expressShipping', parseInt(e.target.value))}
                  className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                  disabled={!isSuperAdmin}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-100">
              <div>
                <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Standard Delivery Days</label>
                <input
                  type="text"
                  value={settings.shipping.estimatedDelivery.standard}
                  onChange={(e) => handleNestedFieldChange('shipping', 'estimatedDelivery', 'standard', e.target.value)}
                  placeholder="e.g. 5-7 Business Days"
                  className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                  disabled={!isSuperAdmin}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Express Delivery Days</label>
                <input
                  type="text"
                  value={settings.shipping.estimatedDelivery.express}
                  onChange={(e) => handleNestedFieldChange('shipping', 'estimatedDelivery', 'express', e.target.value)}
                  placeholder="e.g. 1-2 Business Days"
                  className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                  disabled={!isSuperAdmin}
                />
              </div>
            </div>

            {/* Custom Pincode Rules */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-gray-900 font-black text-sm uppercase tracking-widest mb-1">Custom Pincode Rules</h3>
                  <p className="text-gray-500 text-xs font-medium">Override default delivery times for specific areas</p>
                </div>
                {isSuperAdmin && (
                  <button
                    onClick={handleAddCustomPincode}
                    className="px-4 py-2 bg-primary-50 text-primary-600 font-bold rounded-xl hover:bg-primary-100 transition-all text-xs"
                  >
                    + Add Rule
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {(settings.site?.store?.customPincodes || []).map((rule, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Pincode</label>
                      <input
                        type="text"
                        value={rule.pincode}
                        onChange={(e) => handleCustomPincodeChange(idx, 'pincode', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold outline-none"
                        placeholder="e.g. 600001"
                        disabled={!isSuperAdmin}
                      />
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Days</label>
                      <input
                        type="number"
                        value={rule.deliveryDays}
                        onChange={(e) => handleCustomPincodeChange(idx, 'deliveryDays', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold outline-none"
                        disabled={!isSuperAdmin}
                      />
                    </div>
                    <div className="flex items-center gap-4 mt-4 lg:mt-0">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                        <input
                          type="checkbox"
                          checked={rule.codAvailable}
                          onChange={(e) => handleCustomPincodeChange(idx, 'codAvailable', e.target.checked)}
                          className="w-4 h-4 text-primary-600"
                          disabled={!isSuperAdmin}
                        />
                        COD
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                        <input
                          type="checkbox"
                          checked={rule.freeDelivery}
                          onChange={(e) => handleCustomPincodeChange(idx, 'freeDelivery', e.target.checked)}
                          className="w-4 h-4 text-primary-600"
                          disabled={!isSuperAdmin}
                        />
                        Free Del.
                      </label>
                      {isSuperAdmin && (
                        <button onClick={() => handleRemoveCustomPincode(idx)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg ml-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {(!settings.site?.store?.customPincodes || settings.site.store.customPincodes.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">No custom pincode rules defined.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tax Settings */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <ScaleIcon className="h-24 w-24 text-amber-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8">Taxation & GST</h2>

          <div className="bg-stone-50/50 rounded-3xl p-8 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 font-black text-sm uppercase tracking-widest mb-1">Tax Engine</p>
                <p className="text-gray-500 text-xs font-medium">Auto-apply GST/Sales Tax on checkouts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.tax.enabled}
                  onChange={(e) => handleFieldChange('tax', 'enabled', e.target.checked)}
                  className="sr-only peer"
                  disabled={!isSuperAdmin}
                />
                <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600 shadow-inner"></div>
              </label>
            </div>

            {settings.tax.enabled && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Global Tax Rate (%)</label>
                <div className="relative max-w-[200px]">
                  <input
                    type="number"
                    value={settings.tax.rate}
                    onChange={(e) => handleFieldChange('tax', 'rate', parseFloat(e.target.value))}
                    className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-black focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                    disabled={!isSuperAdmin}
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-gray-400">%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loyalty Program Settings */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <TrophyIcon className="h-24 w-24 text-primary-400" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8 relative z-10">Loyalty & Rewards Bridge</h2>

          <div className="bg-stone-50/50 rounded-3xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-gray-900 font-black text-sm uppercase tracking-widest mb-1">Loyalty Engine</p>
                <p className="text-gray-500 text-xs font-medium">Reward regular customers with point benefits</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.loyalty?.enabled || false}
                  onChange={(e) => handleFieldChange('loyalty', 'enabled', e.target.checked)}
                  className="sr-only peer"
                  disabled={!isSuperAdmin}
                />
                <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600 shadow-inner"></div>
              </label>
            </div>

            {settings.loyalty?.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-gray-100">
                <div>
                  <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Points per ₹10 Spent</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.loyalty?.pointsPerRupee * 10 || 1}
                    onChange={(e) => handleFieldChange('loyalty', 'pointsPerRupee', parseFloat(e.target.value) / 10)}
                    className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                    disabled={!isSuperAdmin}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Minimum for Redemption</label>
                  <input
                    type="number"
                    value={settings.loyalty?.minimumRedeemPoints || 100}
                    onChange={(e) => handleFieldChange('loyalty', 'minimumRedeemPoints', parseInt(e.target.value))}
                    className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                    disabled={!isSuperAdmin}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Point Cash Value (₹)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.loyalty?.redemptionRate || 1}
                    onChange={(e) => handleFieldChange('loyalty', 'redemptionRate', parseFloat(e.target.value))}
                    className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                    disabled={!isSuperAdmin}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Offers & Deals Settings */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <TrophyIcon className="h-24 w-24 text-blue-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8 relative z-10">Flipkart-Style Offers & Deals Bridge</h2>

          <div className="space-y-8">
            {/* Wow Deal */}
            <div className="bg-blue-50/40 rounded-3xl p-8 border border-blue-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-blue-900 font-black text-base tracking-tight mb-1">WOW! Deal Banner</p>
                  <p className="text-blue-600 text-xs font-medium">Prominent blue offer box on product detail pages</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.offers?.wowDeal?.enabled ?? true}
                    onChange={(e) => handleNestedFieldChange('offers', 'wowDeal', 'enabled', e.target.checked)}
                    className="sr-only peer"
                    disabled={!isSuperAdmin}
                  />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                </label>
              </div>

              {settings.offers?.wowDeal?.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-blue-100/50">
                  <div>
                    <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Banner Title</label>
                    <input
                      type="text"
                      value={settings.offers?.wowDeal?.title || ''}
                      onChange={(e) => handleNestedFieldChange('offers', 'wowDeal', 'title', e.target.value)}
                      className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                      disabled={!isSuperAdmin}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Discount %</label>
                    <input
                      type="number"
                      value={settings.offers?.wowDeal?.discountPercentage || 15}
                      onChange={(e) => handleNestedFieldChange('offers', 'wowDeal', 'discountPercentage', parseInt(e.target.value))}
                      className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                      disabled={!isSuperAdmin}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Min Order Value (₹)</label>
                    <input
                      type="number"
                      value={settings.offers?.wowDeal?.minOrderValue || 500}
                      onChange={(e) => handleNestedFieldChange('offers', 'wowDeal', 'minOrderValue', parseInt(e.target.value))}
                      className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                      disabled={!isSuperAdmin}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SuperCoin Benefit */}
            <div className="bg-amber-50/40 rounded-3xl p-8 border border-amber-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-amber-900 font-black text-base tracking-tight mb-1">SuperCoin Benefit</p>
                  <p className="text-amber-600 text-xs font-medium">Allow extra savings using loyalty points/coins</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.offers?.superCoin?.enabled ?? true}
                    onChange={(e) => handleNestedFieldChange('offers', 'superCoin', 'enabled', e.target.checked)}
                    className="sr-only peer"
                    disabled={!isSuperAdmin}
                  />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500 shadow-inner"></div>
                </label>
              </div>

              {settings.offers?.superCoin?.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-amber-100/50">
                  <div>
                    <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Benefit Title</label>
                    <input
                      type="text"
                      value={settings.offers?.superCoin?.benefitTitle || ''}
                      onChange={(e) => handleNestedFieldChange('offers', 'superCoin', 'benefitTitle', e.target.value)}
                      className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
                      disabled={!isSuperAdmin}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Points Discount (₹)</label>
                    <input
                      type="number"
                      value={settings.offers?.superCoin?.pointsDiscount || 12}
                      onChange={(e) => handleNestedFieldChange('offers', 'superCoin', 'pointsDiscount', parseInt(e.target.value))}
                      className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
                      disabled={!isSuperAdmin}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Coins Required</label>
                    <input
                      type="number"
                      value={settings.offers?.superCoin?.coinsRequired || 12}
                      onChange={(e) => handleNestedFieldChange('offers', 'superCoin', 'coinsRequired', parseInt(e.target.value))}
                      className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
                      disabled={!isSuperAdmin}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bank Offers */}
            <div className="bg-stone-50/50 rounded-3xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-900 font-black text-base tracking-tight">Bank & Card Offers</p>
                {isSuperAdmin && (
                  <button
                    onClick={handleAddBankOffer}
                    className="px-4 py-2 bg-primary-50 text-primary-600 font-bold rounded-xl hover:bg-primary-100 transition-all text-xs flex items-center gap-1"
                  >
                    <PlusIcon className="w-4 h-4" /> Add Offer
                  </button>
                )}
              </div>
              <div className="space-y-6">
                {(settings.offers?.bankOffers || []).map((bankOffer, index) => (
                  <div key={bankOffer.id || index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-3">
                      <label className="block text-gray-500 text-xs font-bold mb-2">Offer Title</label>
                      <input
                        type="text"
                        value={bankOffer.title}
                        onChange={(e) => handleBankOfferChange(index, 'title', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 font-bold outline-none"
                        disabled={!isSuperAdmin}
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="block text-gray-500 text-xs font-bold mb-2">Description</label>
                      <input
                        type="text"
                        value={bankOffer.description}
                        onChange={(e) => handleBankOfferChange(index, 'description', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 font-medium outline-none"
                        disabled={!isSuperAdmin}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-gray-500 text-xs font-bold mb-2">Code</label>
                      <input
                        type="text"
                        value={bankOffer.code}
                        onChange={(e) => handleBankOfferChange(index, 'code', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 font-bold outline-none uppercase"
                        disabled={!isSuperAdmin}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-gray-500 text-xs font-bold mb-2">Discount %</label>
                      <input
                        type="number"
                        value={bankOffer.discountPercent}
                        onChange={(e) => handleBankOfferChange(index, 'discountPercent', parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 font-bold outline-none"
                        disabled={!isSuperAdmin}
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      {isSuperAdmin && (
                        <button onClick={() => handleRemoveBankOffer(index)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all h-full mt-6">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {(!settings.offers?.bankOffers || settings.offers.bankOffers.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">No bank offers added yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;