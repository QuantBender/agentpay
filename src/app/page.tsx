'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import Link from 'next/link';
import { useMneeBalance } from '@/hooks/useMnee';

// Mock data for demo (in production, these would come from the contract)
const mockStats = {
  totalAgents: 1247,
  totalPayments: 89432,
  totalVolume: '2,450,000',
  activeServices: 156,
};

const mockRecentPayments = [
  { id: 1, agent: 'GPT-4 Agent', service: 'Weather API', amount: '0.05', time: '2 min ago' },
  { id: 2, agent: 'Claude Agent', service: 'Data Analytics', amount: '0.25', time: '5 min ago' },
  { id: 3, agent: 'Trading Bot', service: 'Price Feed', amount: '0.01', time: '8 min ago' },
  { id: 4, agent: 'Research Agent', service: 'Web Search', amount: '0.10', time: '12 min ago' },
];

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { balance } = useMneeBalance(address);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero Section */}
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent">
          Autonomous AI Payments
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
          Enable your AI agents to pay for services, data, and compute autonomously 
          using <span className="text-emerald-400 font-semibold">MNEE stablecoin</span>. 
          Set budgets, define limits, and let your agents work independently.
        </p>
        
        {!isConnected ? (
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <Link
              href="/agents"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors text-center"
            >
              Create Agent
            </Link>
            <Link
              href="/marketplace"
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors text-center"
            >
              Browse Services
            </Link>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-12 sm:mb-16">
        <StatCard title="Active Agents" value={mockStats.totalAgents.toLocaleString()} icon="🤖" />
        <StatCard title="Total Payments" value={mockStats.totalPayments.toLocaleString()} icon="💸" />
        <StatCard title="Volume (MNEE)" value={`$${mockStats.totalVolume}`} icon="📊" />
        <StatCard title="Services" value={mockStats.activeServices.toString()} icon="🔌" />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
        {/* How It Works */}
        <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold mb-6 text-white">How It Works</h2>
          <div className="space-y-6">
            <Step 
              number={1} 
              title="Create an Agent" 
              description="Register an AI agent with a wallet address and set daily spending limits"
            />
            <Step 
              number={2} 
              title="Fund with MNEE" 
              description="Deposit MNEE stablecoin to your agent's escrow balance"
            />
            <Step 
              number={3} 
              title="Autonomous Payments" 
              description="Your agent can now pay for services automatically within its budget"
            />
            <Step 
              number={4} 
              title="Monitor & Control" 
              description="Track transactions, adjust limits, or pause agents anytime"
            />
          </div>
        </div>

        {/* Your Balance / Recent Activity */}
        <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 sm:p-8">
          {isConnected ? (
            <>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">Your MNEE Balance</h2>
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/40 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                <p className="text-sm text-emerald-300 mb-1">Available Balance</p>
                <p className="text-3xl sm:text-4xl font-bold text-white">{parseFloat(balance).toFixed(2)} <span className="text-lg sm:text-xl text-emerald-300">MNEE</span></p>
                <p className="text-sm text-gray-300 mt-2">≈ ${parseFloat(balance).toFixed(2)} USD</p>
              </div>
              <Link
                href="/agents"
                className="block w-full text-center px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-medium transition-colors"
              >
                Manage Your Agents →
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-6 text-white">Recent Payments</h2>
              <div className="space-y-3">
                {mockRecentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                    <div>
                      <p className="font-medium text-white">{payment.agent}</p>
                      <p className="text-sm text-gray-300">{payment.service}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-emerald-400">{payment.amount} MNEE</p>
                      <p className="text-sm text-gray-400">{payment.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">Built for AI-First Commerce</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <FeatureCard
          icon="🔐"
          title="Secure Escrow"
          description="Funds are held in smart contract escrow. Agents can only spend within their allocated budget."
        />
        <FeatureCard
          icon="⚡"
          title="Instant Payments"
          description="On-chain payments settle in seconds. No waiting for bank transfers or payment processors."
        />
        <FeatureCard
          icon="📊"
          title="Budget Controls"
          description="Set daily limits, pause agents, or withdraw funds instantly. You're always in control."
        />
        <FeatureCard
          icon="🌐"
          title="Global Access"
          description="MNEE is a USD-backed stablecoin. Accept payments from anywhere in the world."
        />
        <FeatureCard
          icon="🔌"
          title="API Marketplace"
          description="Connect to a growing ecosystem of AI-accessible services, APIs, and data providers."
        />
        <FeatureCard
          icon="📱"
          title="Real-time Dashboard"
          description="Monitor all agent activity, spending patterns, and service usage in one place."
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-4 sm:p-6 text-center">
      <div className="text-2xl sm:text-3xl mb-2">{icon}</div>
      <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
      <p className="text-xs sm:text-sm text-gray-300">{title}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 border border-emerald-400/40 rounded-full flex items-center justify-center text-emerald-300 font-bold text-sm">
        {number}
      </div>
      <div>
        <h3 className="font-semibold mb-1 text-white">{title}</h3>
        <p className="text-sm text-gray-300">{description}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-4 sm:p-6 hover:border-emerald-500/50 transition-colors">
      <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">{icon}</div>
      <h3 className="text-base sm:text-lg font-semibold mb-2 text-white">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-300">{description}</p>
    </div>
  );
}
