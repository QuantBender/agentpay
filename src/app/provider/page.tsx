'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { useRegisterServiceProvider, useServiceProvider } from '@/hooks/useAgentPay';
import { AGENT_ESCROW_ADDRESS } from '@/config/wagmi';

export default function ProviderPage() {
  const { address, isConnected } = useAccount();
  const { provider, formattedPrice } = useServiceProvider(address);
  
  const [serviceId, setServiceId] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerCall, setPricePerCall] = useState('0.01');
  const [apiEndpoint, setApiEndpoint] = useState('');

  const { register, isPending, isSuccess } = useRegisterServiceProvider();

  const isDemoMode = AGENT_ESCROW_ADDRESS === '0x0000000000000000000000000000000000000000';
  const isRegistered = provider && provider.serviceId !== '';

  const handleRegister = async () => {
    await register(serviceId, serviceName, pricePerCall);
  };

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center py-12 sm:py-20">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Become a Service Provider</h1>
          <p className="text-gray-300 mb-8 text-sm sm:text-base">Connect your wallet to register as a service provider</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Become a Service Provider</h1>
        <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
          Register your API, AI model, or data service to receive autonomous payments from AI agents using MNEE stablecoin.
        </p>
      </div>

      {isDemoMode && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-8">
          <p className="text-yellow-400 text-sm">
            ⚠️ <strong>Demo Mode:</strong> Contract not deployed. Registration will be simulated for demonstration purposes.
          </p>
        </div>
      )}

      {/* Benefits Section */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
        <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-4 sm:p-6">
          <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">💰</div>
          <h3 className="font-semibold mb-2 text-sm sm:text-base">Instant Payments</h3>
          <p className="text-xs sm:text-sm text-gray-300">
            Receive payments immediately when agents call your service. No invoicing or payment delays.
          </p>
        </div>
        <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-4 sm:p-6">
          <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">🤖</div>
          <h3 className="font-semibold mb-2 text-sm sm:text-base">AI-Native Revenue</h3>
          <p className="text-xs sm:text-sm text-gray-300">
            Tap into the growing market of autonomous AI agents that need to pay for services programmatically.
          </p>
        </div>
        <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-4 sm:p-6 sm:col-span-2 md:col-span-1">
          <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">📊</div>
          <h3 className="font-semibold mb-2 text-sm sm:text-base">Transparent Analytics</h3>
          <p className="text-xs sm:text-sm text-gray-300">
            Track all payments on-chain. Full transparency into your service usage and revenue.
          </p>
        </div>
      </div>

      {/* Registration Form */}
      <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-4 sm:p-8">
        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Register Your Service</h2>

        {isRegistered ? (
          <div className="text-center py-6 sm:py-8">
            <div className="text-4xl sm:text-5xl mb-4">✅</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">You&apos;re Registered!</h3>
            <p className="text-gray-300 mb-6 text-sm sm:text-base">Your service is live and ready to receive payments from AI agents.</p>
            
            <div className="bg-gray-800 rounded-xl p-6 text-left max-w-md mx-auto">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Service ID</p>
                  <p className="font-mono">{provider?.serviceId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Service Name</p>
                  <p>{provider?.serviceName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Price per Call</p>
                  <p className="text-emerald-400 font-semibold">{formattedPrice} MNEE</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    provider?.isActive 
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {provider?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Service ID *</label>
                <input
                  type="text"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="e.g., weather-api-v2"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-emerald-500"
                />
                <p className="text-xs text-gray-400 mt-1">Unique identifier (lowercase, hyphens allowed)</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Service Name *</label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g., Weather API Pro"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-emerald-500"
                />
                <p className="text-xs text-gray-400 mt-1">Display name for your service</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what your service does and how agents can use it..."
                rows={3}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Price per Call (MNEE) *</label>
                <input
                  type="number"
                  value={pricePerCall}
                  onChange={(e) => setPricePerCall(e.target.value)}
                  placeholder="0.01"
                  step="0.001"
                  min="0"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-emerald-500"
                />
                <p className="text-xs text-gray-400 mt-1">Amount agents pay per service call</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">API Endpoint (optional)</label>
                <input
                  type="url"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="https://api.yourservice.com/v1"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-emerald-500"
                />
                <p className="text-xs text-gray-400 mt-1">Your service&apos;s API endpoint URL</p>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4">
              <h4 className="font-medium mb-2">How it works</h4>
              <ol className="text-sm text-gray-300 space-y-2">
                <li>1. Register your service with a price per call</li>
                <li>2. Agents discover your service in the marketplace</li>
                <li>3. When an agent calls your service, payment is automatically deducted</li>
                <li>4. You receive MNEE directly to your wallet ({address?.slice(0, 6)}...{address?.slice(-4)})</li>
              </ol>
            </div>

            <button
              onClick={handleRegister}
              disabled={!serviceId || !serviceName || !pricePerCall || isPending}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              {isPending ? 'Registering...' : 'Register Service'}
            </button>

            {isSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-center">
                <p className="text-emerald-400">✓ Service registered successfully!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Integration Guide */}
      <div className="mt-8 sm:mt-12 bg-gray-900/70 border border-gray-700 rounded-2xl p-4 sm:p-8">
        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Integration Guide</h2>
        
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h3 className="font-medium mb-3 text-sm sm:text-base">1. Verify Payment</h3>
            <p className="text-xs sm:text-sm text-gray-300 mb-3">
              When receiving a request, verify the payment was made on-chain before processing:
            </p>
            <div className="bg-gray-800 rounded-lg p-3 sm:p-4 overflow-x-auto">
              <pre className="text-xs sm:text-sm text-gray-300 whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal">
{`// Example: Verify payment in your backend
const verifyPayment = async (paymentId, agentAddress) => {
  const contract = new ethers.Contract(ESCROW_ADDRESS, ABI, provider);
  const payment = await contract.payments(paymentId);
  
  return payment.serviceProvider === YOUR_ADDRESS && 
         payment.agent === agentAddress;
};`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">2. Handle Requests</h3>
            <p className="text-sm text-gray-300 mb-3">
              Your API should accept requests with payment proof:
            </p>
            <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-300">
{`// Example request from an agent
{
  "payment_id": "0x...",
  "agent_address": "0x...",
  "params": {
    // Your service-specific parameters
  }
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">3. SDK Integration (Coming Soon)</h3>
            <p className="text-sm text-gray-300">
              We&apos;re building an SDK to make integration even easier. Join our Discord to get early access!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
