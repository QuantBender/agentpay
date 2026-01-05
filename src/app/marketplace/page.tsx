'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { useExecutePayment } from '@/hooks/useAgentPay';
import { AGENT_ESCROW_ADDRESS } from '@/config/wagmi';

// Mock services for demo
const mockServices = [
  {
    id: 'weather-api',
    name: 'Weather API Pro',
    description: 'Real-time weather data for any location worldwide. Supports forecasts, historical data, and alerts.',
    category: 'Data',
    pricePerCall: '0.01',
    provider: '0x1111111111111111111111111111111111111111' as `0x${string}`,
    providerName: 'WeatherCo',
    calls24h: 15420,
    rating: 4.8,
    icon: '🌤️',
  },
  {
    id: 'gpt4-inference',
    name: 'GPT-4 Inference',
    description: 'Access GPT-4 API for text generation, analysis, and reasoning tasks. Pay per token.',
    category: 'AI',
    pricePerCall: '0.05',
    provider: '0x2222222222222222222222222222222222222222' as `0x${string}`,
    providerName: 'AI Gateway',
    calls24h: 89000,
    rating: 4.9,
    icon: '🤖',
  },
  {
    id: 'web-search',
    name: 'Web Search API',
    description: 'Search the web programmatically. Get structured results, snippets, and metadata.',
    category: 'Data',
    pricePerCall: '0.02',
    provider: '0x3333333333333333333333333333333333333333' as `0x${string}`,
    providerName: 'SearchHub',
    calls24h: 45600,
    rating: 4.7,
    icon: '🔍',
  },
  {
    id: 'image-generation',
    name: 'Image Generation',
    description: 'Generate images from text prompts using state-of-the-art diffusion models.',
    category: 'AI',
    pricePerCall: '0.10',
    provider: '0x4444444444444444444444444444444444444444' as `0x${string}`,
    providerName: 'ImageGen Labs',
    calls24h: 12300,
    rating: 4.6,
    icon: '🎨',
  },
  {
    id: 'crypto-prices',
    name: 'Crypto Price Feed',
    description: 'Real-time cryptocurrency prices from multiple exchanges. Sub-second updates.',
    category: 'Finance',
    pricePerCall: '0.005',
    provider: '0x5555555555555555555555555555555555555555' as `0x${string}`,
    providerName: 'PriceFeed Pro',
    calls24h: 234000,
    rating: 4.9,
    icon: '📈',
  },
  {
    id: 'code-execution',
    name: 'Secure Code Runner',
    description: 'Execute Python, JavaScript, and other code in sandboxed environments.',
    category: 'Compute',
    pricePerCall: '0.03',
    provider: '0x6666666666666666666666666666666666666666' as `0x${string}`,
    providerName: 'RunSafe',
    calls24h: 8900,
    rating: 4.5,
    icon: '⚡',
  },
  {
    id: 'translation-api',
    name: 'Neural Translation',
    description: 'Translate text between 100+ languages with context-aware neural models.',
    category: 'AI',
    pricePerCall: '0.01',
    provider: '0x7777777777777777777777777777777777777777' as `0x${string}`,
    providerName: 'LinguaAI',
    calls24h: 67000,
    rating: 4.8,
    icon: '🌐',
  },
  {
    id: 'storage-ipfs',
    name: 'IPFS Storage',
    description: 'Decentralized file storage on IPFS. Pin and retrieve files with content addressing.',
    category: 'Storage',
    pricePerCall: '0.02',
    provider: '0x8888888888888888888888888888888888888888' as `0x${string}`,
    providerName: 'PinataGate',
    calls24h: 5600,
    rating: 4.4,
    icon: '💾',
  },
];

const categories = ['All', 'AI', 'Data', 'Finance', 'Compute', 'Storage'];

export default function MarketplacePage() {
  const { isConnected } = useAccount();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<typeof mockServices[0] | null>(null);

  const isDemoMode = AGENT_ESCROW_ADDRESS === '0x0000000000000000000000000000000000000000';

  const filteredServices = mockServices.filter((service) => {
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Service Marketplace</h1>
        <p className="text-gray-300 mt-1 text-sm sm:text-base">Browse and connect your agents to AI-accessible services</p>
      </div>

      {isDemoMode && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
          <p className="text-blue-400 text-sm">
            ℹ️ <strong>Demo Mode:</strong> These are sample services for demonstration. In production, services would be registered on-chain.
          </p>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 mb-6 sm:mb-8">
        <div className="w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services..."
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-gray-900/70 border border-gray-700 rounded-lg p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold">{mockServices.length}</p>
          <p className="text-xs sm:text-sm text-gray-300">Services</p>
        </div>
        <div className="bg-gray-900/70 border border-gray-700 rounded-lg p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold">478K</p>
          <p className="text-xs sm:text-sm text-gray-300">Calls Today</p>
        </div>
        <div className="bg-gray-900/70 border border-gray-700 rounded-lg p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold">$0.005</p>
          <p className="text-xs sm:text-sm text-gray-300">Avg Price</p>
        </div>
        <div className="bg-gray-900/70 border border-gray-700 rounded-lg p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold">99.9%</p>
          <p className="text-xs sm:text-sm text-gray-300">Uptime</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredServices.map((service) => (
          <ServiceCard 
            key={service.id} 
            service={service}
            onSelect={() => setSelectedService(service)}
          />
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-300">No services found matching your criteria</p>
        </div>
      )}

      {/* Service Details Modal */}
      {selectedService && (
        <ServiceDetailsModal 
          service={selectedService}
          onClose={() => setSelectedService(null)}
          isConnected={isConnected}
        />
      )}
    </div>
  );
}

function ServiceCard({ 
  service, 
  onSelect 
}: { 
  service: typeof mockServices[0];
  onSelect: () => void;
}) {
  return (
    <div 
      onClick={onSelect}
      className="bg-gray-900/70 border border-gray-700 rounded-xl p-4 sm:p-6 hover:border-emerald-500/30 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="text-3xl sm:text-4xl">{service.icon}</div>
        <span className="px-2 py-1 bg-gray-800 rounded-full text-xs text-gray-300">
          {service.category}
        </span>
      </div>

      <h3 className="font-semibold text-base sm:text-lg mb-2">{service.name}</h3>
      <p className="text-xs sm:text-sm text-gray-300 mb-4 line-clamp-2">{service.description}</p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <div>
          <p className="text-emerald-400 font-semibold">{service.pricePerCall} MNEE</p>
          <p className="text-xs text-gray-400">per call</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span className="text-sm">{service.rating}</span>
          </div>
          <p className="text-xs text-gray-400">{(service.calls24h / 1000).toFixed(1)}K calls/day</p>
        </div>
      </div>
    </div>
  );
}

function ServiceDetailsModal({ 
  service, 
  onClose,
  isConnected 
}: { 
  service: typeof mockServices[0];
  onClose: () => void;
  isConnected: boolean;
}) {
  const [testInput, setTestInput] = useState('');
  const { executePayment, isPending } = useExecutePayment();

  const handleTestCall = async () => {
    if (!isConnected) return;
    await executePayment(service.provider, `test-${Date.now()}`);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{service.icon}</div>
              <div>
                <h2 className="text-xl font-bold">{service.name}</h2>
                <p className="text-sm text-gray-300">by {service.providerName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-gray-300">{service.description}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 text-center">
              <p className="text-lg sm:text-2xl font-bold text-emerald-400">{service.pricePerCall}</p>
              <p className="text-xs text-gray-400">MNEE per call</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 text-center">
              <p className="text-lg sm:text-2xl font-bold">{(service.calls24h / 1000).toFixed(1)}K</p>
              <p className="text-xs text-gray-400">calls today</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-yellow-400 text-lg sm:text-xl">★</span>
                <span className="text-lg sm:text-2xl font-bold">{service.rating}</span>
              </div>
              <p className="text-xs text-gray-400">rating</p>
            </div>
          </div>

          {/* API Endpoint Example */}
          <div>
            <h3 className="font-medium mb-2">API Endpoint</h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <code className="text-sm text-emerald-400">
                POST https://api.agentpay.io/v1/services/{service.id}/call
              </code>
            </div>
          </div>

          {/* Example Request */}
          <div>
            <h3 className="font-medium mb-2">Example Request</h3>
            <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-300">
{`{
  "agent_address": "0x...",
  "payment_signature": "0x...",
  "params": {
    "query": "example input"
  }
}`}
              </pre>
            </div>
          </div>

          {/* Test Call (for demo) */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <h3 className="font-medium mb-3">Test This Service</h3>
            {isConnected ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Enter test input..."
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleTestCall}
                  disabled={isPending}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 rounded-lg font-medium transition-colors"
                >
                  {isPending ? 'Processing...' : `Call Service (${service.pricePerCall} MNEE)`}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-300 mb-3">Connect wallet to test this service</p>
                <ConnectButton />
              </div>
            )}
          </div>

          {/* Provider Info */}
          <div className="pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Provider Address</p>
                <p className="text-xs font-mono text-gray-300">{service.provider}</p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">
                Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
