import { useState, useEffect } from 'react';
import { CogIcon } from '@heroicons/react/24/outline';
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

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bronze"></div></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        {isSuperAdmin && (
          <button
            onClick={handleSave}
            className="bg-bronze text-black px-4 py-2 rounded-lg hover:bg-gold"
          >
            Save Settings
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Payment Settings */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Payment Methods</h2>
          
          <div className="space-y-6">
            {/* Razorpay */}
            <div className="border border-gray-700 rounded-lg p-4">
              <label className="flex items-center text-white mb-4">
                <input
                  type="checkbox"
                  checked={settings.payment.razorpay.enabled}
                  onChange={(e) => handleNestedFieldChange('payment', 'razorpay', 'enabled', e.target.checked)}
                  className="mr-3"
                  disabled={!isSuperAdmin}
                />
                <span className="font-semibold">Razorpay (Recommended for India)</span>
              </label>
              
              {settings.payment.razorpay.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="block text-white mb-2">Key ID</label>
                    <input
                      type="text"
                      value={settings.payment.razorpay.keyId}
                      onChange={(e) => handleNestedFieldChange('payment', 'razorpay', 'keyId', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="rzp_test_..."
                      disabled={!isSuperAdmin}
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Key Secret</label>
                    <input
                      type="password"
                      value={settings.payment.razorpay.keySecret}
                      onChange={(e) => handleNestedFieldChange('payment', 'razorpay', 'keySecret', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="Enter secret key"
                      disabled={!isSuperAdmin}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Stripe */}
            <div className="border border-gray-700 rounded-lg p-4">
              <label className="flex items-center text-white mb-4">
                <input
                  type="checkbox"
                  checked={settings.payment.stripe.enabled}
                  onChange={(e) => handleNestedFieldChange('payment', 'stripe', 'enabled', e.target.checked)}
                  className="mr-3"
                  disabled={!isSuperAdmin}
                />
                <span className="font-semibold">Stripe (International)</span>
              </label>
              
              {settings.payment.stripe.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="block text-white mb-2">Public Key</label>
                    <input
                      type="text"
                      value={settings.payment.stripe.publicKey}
                      onChange={(e) => handleNestedFieldChange('payment', 'stripe', 'publicKey', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="pk_test_..."
                      disabled={!isSuperAdmin}
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Secret Key</label>
                    <input
                      type="password"
                      value={settings.payment.stripe.secretKey}
                      onChange={(e) => handleNestedFieldChange('payment', 'stripe', 'secretKey', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="sk_test_..."
                      disabled={!isSuperAdmin}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* QR Code Payment */}
            <div className="border border-gray-700 rounded-lg p-4">
              <label className="flex items-center text-white mb-4">
                <input
                  type="checkbox"
                  checked={settings.payment.qr.enabled}
                  onChange={(e) => handleNestedFieldChange('payment', 'qr', 'enabled', e.target.checked)}
                  className="mr-3"
                  disabled={!isSuperAdmin}
                />
                <span className="font-semibold">QR Code Payment (UPI)</span>
              </label>
              
              {settings.payment.qr.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="block text-white mb-2">UPI ID</label>
                    <input
                      type="text"
                      value={settings.payment.qr.upiId}
                      onChange={(e) => handleNestedFieldChange('payment', 'qr', 'upiId', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="yourname@paytm"
                      disabled={!isSuperAdmin}
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Merchant Name</label>
                    <input
                      type="text"
                      value={settings.payment.qr.merchantName}
                      onChange={(e) => handleNestedFieldChange('payment', 'qr', 'merchantName', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="SilaiMart"
                      disabled={!isSuperAdmin}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cash on Delivery */}
            <div className="border border-gray-700 rounded-lg p-4">
              <label className="flex items-center text-white mb-4">
                <input
                  type="checkbox"
                  checked={settings.payment.cod.enabled}
                  onChange={(e) => handleNestedFieldChange('payment', 'cod', 'enabled', e.target.checked)}
                  className="mr-3"
                  disabled={!isSuperAdmin}
                />
                <span className="font-semibold">Cash on Delivery</span>
              </label>

              {settings.payment.cod.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="block text-white mb-2">Minimum Amount (₹)</label>
                    <input
                      type="number"
                      value={settings.payment.cod.minimumAmount}
                      onChange={(e) => handleNestedFieldChange('payment', 'cod', 'minimumAmount', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                      disabled={!isSuperAdmin}
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Maximum Amount (₹)</label>
                    <input
                      type="number"
                      value={settings.payment.cod.maximumAmount}
                      onChange={(e) => handleNestedFieldChange('payment', 'cod', 'maximumAmount', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                      disabled={!isSuperAdmin}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Settings */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Shipping Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white mb-2">Free Shipping Threshold (₹)</label>
              <input
                type="number"
                value={settings.shipping.freeShippingThreshold}
                onChange={(e) => handleFieldChange('shipping', 'freeShippingThreshold', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                disabled={!isSuperAdmin}
              />
            </div>

            <div>
              <label className="block text-white mb-2">Standard Shipping (₹)</label>
              <input
                type="number"
                value={settings.shipping.standardShipping}
                onChange={(e) => handleFieldChange('shipping', 'standardShipping', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                disabled={!isSuperAdmin}
              />
            </div>

            <div>
              <label className="block text-white mb-2">Express Shipping (₹)</label>
              <input
                type="number"
                value={settings.shipping.expressShipping}
                onChange={(e) => handleFieldChange('shipping', 'expressShipping', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                disabled={!isSuperAdmin}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-white mb-2">Standard Delivery Time</label>
              <input
                type="text"
                value={settings.shipping.estimatedDelivery.standard}
                onChange={(e) => handleNestedFieldChange('shipping', 'estimatedDelivery', 'standard', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                disabled={!isSuperAdmin}
              />
            </div>

            <div>
              <label className="block text-white mb-2">Express Delivery Time</label>
              <input
                type="text"
                value={settings.shipping.estimatedDelivery.express}
                onChange={(e) => handleNestedFieldChange('shipping', 'estimatedDelivery', 'express', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                disabled={!isSuperAdmin}
              />
            </div>
          </div>
        </div>

        {/* Tax Settings */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Tax Configuration</h2>
          
          <div className="space-y-4">
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={settings.tax.enabled}
                onChange={(e) => handleFieldChange('tax', 'enabled', e.target.checked)}
                className="mr-3"
                disabled={!isSuperAdmin}
              />
              Enable Tax Calculation
            </label>

            {settings.tax.enabled && (
              <div>
                <label className="block text-white mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  value={settings.tax.rate}
                  onChange={(e) => handleFieldChange('tax', 'rate', parseFloat(e.target.value))}
                  className="w-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  disabled={!isSuperAdmin}
                />
              </div>
            )}
          </div>
        </div>

        {/* Loyalty Program Settings */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Loyalty Program</h2>
          
          <div className="space-y-4">
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={settings.loyalty?.enabled || false}
                onChange={(e) => handleFieldChange('loyalty', 'enabled', e.target.checked)}
                className="mr-3"
                disabled={!isSuperAdmin}
              />
              Enable Loyalty Program
            </label>

            {settings.loyalty?.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white mb-2">Points per ₹10 spent</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.loyalty?.pointsPerRupee * 10 || 1}
                    onChange={(e) => handleFieldChange('loyalty', 'pointsPerRupee', parseFloat(e.target.value) / 10)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    disabled={!isSuperAdmin}
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Minimum Redeem Points</label>
                  <input
                    type="number"
                    value={settings.loyalty?.minimumRedeemPoints || 100}
                    onChange={(e) => handleFieldChange('loyalty', 'minimumRedeemPoints', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    disabled={!isSuperAdmin}
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Redemption Rate (₹ per point)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.loyalty?.redemptionRate || 1}
                    onChange={(e) => handleFieldChange('loyalty', 'redemptionRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    disabled={!isSuperAdmin}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;