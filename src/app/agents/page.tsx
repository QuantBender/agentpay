'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { useMneeBalance } from '@/hooks/useMnee';
import { 
  useOwnerAgents, 
  useCreateAgent, 
  useFundAgent,
  useWithdrawFromAgent,
  useUpdateAgentLimit,
  useToggleAgent 
} from '@/hooks/useAgentPay';
import { AGENT_ESCROW_ADDRESS } from '@/config/wagmi';

// Mock agents for demo (when contract not deployed)
const mockAgents = [
  {
    address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    agentId: 'gpt-4-research',
    name: 'GPT-4 Research Agent',
    balance: '150.00',
    dailyLimit: '50.00',
    spentToday: '12.50',
    isActive: true,
  },
  {
    address: '0x2345678901234567890123456789012345678901' as `0x${string}`,
    agentId: 'claude-analyst',
    name: 'Claude Data Analyst',
    balance: '75.00',
    dailyLimit: '25.00',
    spentToday: '8.00',
    isActive: true,
  },
  {
    address: '0x3456789012345678901234567890123456789012' as `0x${string}`,
    agentId: 'trading-bot-v2',
    name: 'Trading Bot v2',
    balance: '500.00',
    dailyLimit: '100.00',
    spentToday: '0.00',
    isActive: false,
  },
];

export default function AgentsPage() {
  const { address, isConnected } = useAccount();
  const { balance } = useMneeBalance(address);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { agents: _onChainAgents } = useOwnerAgents(address);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<typeof mockAgents[0] | null>(null);

  // Use mock data for demo when contract not deployed
  const isDemoMode = AGENT_ESCROW_ADDRESS === '0x0000000000000000000000000000000000000000';
  const displayAgents = isDemoMode ? mockAgents : [];

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold mb-4">My AI Agents</h1>
          <p className="text-gray-300 mb-8">Connect your wallet to manage your AI agents</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My AI Agents</h1>
          <p className="text-gray-300 mt-1 text-sm sm:text-base">Create and manage autonomous payment agents</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <span>+</span> Create Agent
        </button>
      </div>

      {/* Wallet Balance */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-sm text-emerald-400 mb-1">Your MNEE Balance</p>
            <p className="text-2xl sm:text-3xl font-bold">{parseFloat(balance).toFixed(2)} <span className="text-base sm:text-lg text-emerald-400">MNEE</span></p>
          </div>
          <div className="sm:text-right">
            <p className="text-sm text-gray-300 mb-1">Available to fund agents</p>
            <p className="text-gray-300">≈ ${parseFloat(balance).toFixed(2)} USD</p>
          </div>
        </div>
      </div>

      {isDemoMode && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
          <p className="text-yellow-400 text-sm">
            ⚠️ <strong>Demo Mode:</strong> AgentPay Escrow contract not deployed. Showing sample agents for demonstration.
          </p>
        </div>
      )}

      {/* Agents Grid */}
      {displayAgents.length === 0 ? (
        <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-8 sm:p-12 text-center">
          <div className="text-4xl sm:text-5xl mb-4">🤖</div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">No Agents Yet</h3>
          <p className="text-gray-300 mb-6 text-sm sm:text-base">Create your first AI agent to start making autonomous payments</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-medium transition-colors"
          >
            Create Your First Agent
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {displayAgents.map((agent) => (
            <AgentCard 
              key={agent.address} 
              agent={agent} 
              onSelect={() => setSelectedAgent(agent)}
            />
          ))}
        </div>
      )}

      {/* Create Agent Modal */}
      {showCreateModal && (
        <CreateAgentModal 
          onClose={() => setShowCreateModal(false)} 
          walletBalance={balance}
        />
      )}

      {/* Agent Details Modal */}
      {selectedAgent && (
        <AgentDetailsModal 
          agent={selectedAgent} 
          onClose={() => setSelectedAgent(null)}
          walletBalance={balance}
        />
      )}
    </div>
  );
}

function AgentCard({ 
  agent, 
  onSelect 
}: { 
  agent: typeof mockAgents[0]; 
  onSelect: () => void;
}) {
  const spentPercentage = (parseFloat(agent.spentToday) / parseFloat(agent.dailyLimit)) * 100;
  
  return (
    <div 
      onClick={onSelect}
      className="bg-gray-900/70 border border-gray-700 rounded-xl p-4 sm:p-6 hover:border-emerald-500/30 transition-colors cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-base sm:text-lg truncate">{agent.name}</h3>
          <p className="text-xs sm:text-sm text-gray-400 font-mono truncate">{agent.agentId}</p>
        </div>
        <span className={`ml-2 flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${
          agent.isActive 
            ? 'bg-emerald-500/20 text-emerald-400' 
            : 'bg-gray-500/20 text-gray-300'
        }`}>
          {agent.isActive ? 'Active' : 'Paused'}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">Balance</span>
            <span className="font-medium">{agent.balance} MNEE</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">Daily Limit</span>
            <span className="text-gray-300">{agent.spentToday} / {agent.dailyLimit} MNEE</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 font-mono truncate">{agent.address}</p>
      </div>
    </div>
  );
}

function CreateAgentModal({ 
  onClose, 
  walletBalance 
}: { 
  onClose: () => void; 
  walletBalance: string;
}) {
  const [agentId, setAgentId] = useState('');
  const [agentName, setAgentName] = useState('');
  const [dailyLimit, setDailyLimit] = useState('50');
  const [initialFunding, setInitialFunding] = useState('100');
  
  const { createAgent, isPending } = useCreateAgent();

  const handleCreate = async () => {
    // In production, this would generate a new wallet for the agent
    // For demo, we'll use a random address
    const agentAddress = `0x${Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}` as `0x${string}`;
    
    await createAgent(agentAddress, agentId, dailyLimit);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold">Create New Agent</h2>
          <p className="text-sm text-gray-300 mt-1">Set up an AI agent with autonomous payment capabilities</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Agent ID</label>
            <input
              type="text"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              placeholder="e.g., gpt-4-assistant"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Agent Name</label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="e.g., Research Assistant"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Daily Spending Limit (MNEE)</label>
            <input
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              placeholder="50"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-emerald-500"
            />
            <p className="text-xs text-gray-400 mt-1">Maximum amount agent can spend per day</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Initial Funding (MNEE)</label>
            <input
              type="number"
              value={initialFunding}
              onChange={(e) => setInitialFunding(e.target.value)}
              placeholder="100"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-emerald-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Your balance: {parseFloat(walletBalance).toFixed(2)} MNEE
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!agentId || !dailyLimit || isPending}
            className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {isPending ? 'Creating...' : 'Create Agent'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AgentDetailsModal({ 
  agent, 
  onClose,
  walletBalance 
}: { 
  agent: typeof mockAgents[0]; 
  onClose: () => void;
  walletBalance: string;
}) {
  const [fundAmount, setFundAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [newLimit, setNewLimit] = useState(agent.dailyLimit);

  const { fundAgent, isPending: isFunding } = useFundAgent();
  const { withdraw, isPending: isWithdrawing } = useWithdrawFromAgent();
  const { updateLimit, isPending: isUpdatingLimit } = useUpdateAgentLimit();
  const { activate, deactivate, isPending: isToggling } = useToggleAgent();

  const spentPercentage = (parseFloat(agent.spentToday) / parseFloat(agent.dailyLimit)) * 100;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">{agent.name}</h2>
            <p className="text-sm text-gray-400 font-mono">{agent.agentId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status & Balance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-sm text-gray-300 mb-1">Balance</p>
              <p className="text-xl sm:text-2xl font-bold">{agent.balance} <span className="text-sm text-emerald-400">MNEE</span></p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-sm text-gray-300 mb-1">Status</p>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${agent.isActive ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                <span className="text-base sm:text-lg font-medium">{agent.isActive ? 'Active' : 'Paused'}</span>
              </div>
            </div>
          </div>

          {/* Daily Limit Progress */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-300">Daily Spending</span>
              <span>{agent.spentToday} / {agent.dailyLimit} MNEE</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">Resets daily at midnight UTC</p>
          </div>

          {/* Fund Agent */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="font-medium mb-3">Fund Agent</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="number"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                placeholder="Amount in MNEE"
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => fundAgent(agent.address, fundAmount)}
                disabled={!fundAmount || isFunding}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                {isFunding ? 'Funding...' : 'Fund'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Your balance: {parseFloat(walletBalance).toFixed(2)} MNEE</p>
          </div>

          {/* Withdraw */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="font-medium mb-3">Withdraw Funds</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Amount in MNEE"
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => withdraw(agent.address, withdrawAmount)}
                disabled={!withdrawAmount || isWithdrawing}
                className="w-full sm:w-auto px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded-lg font-medium transition-colors"
              >
                {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
              </button>
            </div>
          </div>

          {/* Update Daily Limit */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="font-medium mb-3">Daily Limit</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="number"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => updateLimit(agent.address, newLimit)}
                disabled={newLimit === agent.dailyLimit || isUpdatingLimit}
                className="w-full sm:w-auto px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded-lg font-medium transition-colors"
              >
                {isUpdatingLimit ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>

          {/* Toggle Agent */}
          <button
            onClick={() => agent.isActive ? deactivate(agent.address) : activate(agent.address)}
            disabled={isToggling}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              agent.isActive 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
            }`}
          >
            {isToggling ? 'Processing...' : agent.isActive ? 'Pause Agent' : 'Activate Agent'}
          </button>

          {/* Address */}
          <div className="text-center">
            <p className="text-xs text-gray-400">Agent Address</p>
            <p className="text-xs sm:text-sm font-mono text-gray-300 break-all">{agent.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
