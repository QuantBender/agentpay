'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

// Mock data for analytics (would be fetched from contract in production)
const mockAgentStats = {
  totalAgents: 12,
  activeAgents: 9,
  totalBalance: '45,230.50',
  totalSpent: '128,450.00',
};

const mockPaymentData = [
  { date: 'Jan 1', payments: 45, volume: 1250 },
  { date: 'Jan 2', payments: 52, volume: 1480 },
  { date: 'Jan 3', payments: 38, volume: 980 },
  { date: 'Jan 4', payments: 65, volume: 1890 },
  { date: 'Jan 5', payments: 78, volume: 2340 },
  { date: 'Jan 6', payments: 92, volume: 2780 },
  { date: 'Jan 7', payments: 85, volume: 2450 },
];

const mockTopProviders = [
  { name: 'GPT-4 API', address: '0x1234...5678', revenue: '12,450.00', calls: 4532 },
  { name: 'Claude API', address: '0x2345...6789', revenue: '8,920.00', calls: 3210 },
  { name: 'Image Gen', address: '0x3456...7890', revenue: '6,780.00', calls: 2890 },
  { name: 'Voice AI', address: '0x4567...8901', revenue: '4,230.00', calls: 1567 },
  { name: 'Data API', address: '0x5678...9012', revenue: '2,890.00', calls: 987 },
];

const mockRecentPayments = [
  { id: '0x1a2b...', agent: 'Agent-GPT-1', provider: 'GPT-4 API', amount: '2.50', time: '2 min ago' },
  { id: '0x2b3c...', agent: 'Agent-Claude', provider: 'Claude API', amount: '1.80', time: '5 min ago' },
  { id: '0x3c4d...', agent: 'Agent-Multi', provider: 'Image Gen', amount: '5.00', time: '8 min ago' },
  { id: '0x4d5e...', agent: 'Agent-GPT-2', provider: 'Voice AI', amount: '3.20', time: '12 min ago' },
  { id: '0x5e6f...', agent: 'Agent-Data', provider: 'Data API', amount: '0.50', time: '15 min ago' },
];

const mockAgentList = [
  { id: 'agent-gpt-1', name: 'Agent-GPT-1', balance: '1,250.00', spent: '4,520.00', status: 'active' },
  { id: 'agent-claude', name: 'Agent-Claude', balance: '890.00', spent: '3,210.00', status: 'active' },
  { id: 'agent-multi', name: 'Agent-Multi', balance: '2,100.00', spent: '8,450.00', status: 'active' },
  { id: 'agent-gpt-2', name: 'Agent-GPT-2', balance: '450.00', spent: '1,890.00', status: 'paused' },
  { id: 'agent-data', name: 'Agent-Data', balance: '3,200.00', spent: '12,340.00', status: 'active' },
];

export default function AnalyticsPage() {
  const { isConnected, address } = useAccount();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  // Calculate max for chart scaling
  const maxVolume = Math.max(...mockPaymentData.map(d => d.volume));

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-gray-400 mt-1">Monitor your agents performance and spending</p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex gap-2 bg-gray-800/50 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {!isConnected ? (
          <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400">Connect your wallet to view analytics for your agents</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Agents</p>
                    <p className="text-2xl font-bold text-white mt-1">{mockAgentStats.totalAgents}</p>
                  </div>
                  <div className="text-3xl">🤖</div>
                </div>
                <p className="text-green-400 text-sm mt-2">
                  {mockAgentStats.activeAgents} active
                </p>
              </div>

              <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Balance</p>
                    <p className="text-2xl font-bold text-white mt-1">${mockAgentStats.totalBalance}</p>
                  </div>
                  <div className="text-3xl">💰</div>
                </div>
                <p className="text-gray-400 text-sm mt-2">MNEE in escrow</p>
              </div>

              <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Spent</p>
                    <p className="text-2xl font-bold text-white mt-1">${mockAgentStats.totalSpent}</p>
                  </div>
                  <div className="text-3xl">📈</div>
                </div>
                <p className="text-purple-400 text-sm mt-2">+12.5% this week</p>
              </div>

              <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg Per Agent</p>
                    <p className="text-2xl font-bold text-white mt-1">$10,704</p>
                  </div>
                  <div className="text-3xl">⚡</div>
                </div>
                <p className="text-gray-400 text-sm mt-2">Lifetime average</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Payment Volume Chart */}
              <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Payment Volume</h3>
                <div className="h-64 flex items-end gap-2">
                  {mockPaymentData.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-md transition-all hover:from-purple-500 hover:to-purple-300"
                        style={{ height: `${(day.volume / maxVolume) * 100}%` }}
                        title={`$${day.volume} MNEE`}
                      />
                      <span className="text-xs text-gray-500">{day.date.split(' ')[1]}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-sm text-gray-400">
                  <span>Total: ${mockPaymentData.reduce((a, b) => a + b.volume, 0).toLocaleString()}</span>
                  <span>{mockPaymentData.reduce((a, b) => a + b.payments, 0)} payments</span>
                </div>
              </div>

              {/* Top Providers */}
              <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Top Service Providers</h3>
                <div className="space-y-3">
                  {mockTopProviders.map((provider, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">{provider.name}</span>
                          <span className="text-green-400 font-medium">${provider.revenue}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-sm">{provider.address}</span>
                          <span className="text-gray-500 text-sm">{provider.calls.toLocaleString()} calls</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Agent Performance Table */}
            <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Agent Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                      <th className="pb-3 font-medium">Agent</th>
                      <th className="pb-3 font-medium">Balance</th>
                      <th className="pb-3 font-medium">Total Spent</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockAgentList.map((agent) => {
                      const balance = parseFloat(agent.balance.replace(',', ''));
                      const spent = parseFloat(agent.spent.replace(',', ''));
                      const utilization = Math.round((spent / (balance + spent)) * 100);
                      
                      return (
                        <tr key={agent.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm">
                                🤖
                              </div>
                              <span className="text-white font-medium">{agent.name}</span>
                            </div>
                          </td>
                          <td className="py-4 text-gray-300">${agent.balance}</td>
                          <td className="py-4 text-gray-300">${agent.spent}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              agent.status === 'active' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {agent.status}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                  style={{ width: `${utilization}%` }}
                                />
                              </div>
                              <span className="text-gray-400 text-sm">{utilization}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Payments</h3>
                <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {mockRecentPayments.map((payment) => (
                  <div 
                    key={payment.id} 
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <span className="text-green-400">✓</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{payment.agent} → {payment.provider}</p>
                        <p className="text-gray-500 text-sm">{payment.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">${payment.amount} MNEE</p>
                      <p className="text-gray-500 text-sm">{payment.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
