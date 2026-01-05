'use client';

import { useAccount, useConnect, useDisconnect, useEnsName, useBalance } from 'wagmi';
import { useState } from 'react';
import { formatUnits } from 'viem';

export function ConnectButton() {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: balance } = useBalance({ address });
  const [showDropdown, setShowDropdown] = useState(false);

  // Format balance properly
  const formattedBalance = balance 
    ? parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)
    : '0';

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
        >
          <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full" />
          <span className="text-sm font-medium text-white hidden sm:inline">
            {ensName || `${address.slice(0, 6)}...${address.slice(-4)}`}
          </span>
          <span className="text-sm font-medium text-white sm:hidden">
            {`${address.slice(0, 4)}...${address.slice(-3)}`}
          </span>
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50">
              <div className="p-4 border-b border-gray-700">
                <p className="text-xs text-gray-400 mb-1">Connected with {connector?.name}</p>
                <p className="font-mono text-sm break-all text-white">{address}</p>
              </div>
              {balance && (
                <div className="p-4 border-b border-gray-700">
                  <p className="text-xs text-gray-400 mb-1">{balance.symbol} Balance</p>
                  <p className="font-medium text-white">{formattedBalance} {balance.symbol}</p>
                </div>
              )}
              <div className="p-2">
                <button
                  onClick={() => {
                    disconnect();
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Find MetaMask or injected connector
  const metaMaskConnector = connectors.find(c => c.id === 'metaMask' || c.id === 'io.metamask');
  const injectedConnector = connectors.find(c => c.id === 'injected');
  const preferredConnector = metaMaskConnector || injectedConnector || connectors[0];

  return (
    <button
      onClick={() => preferredConnector && connect({ connector: preferredConnector })}
      disabled={isPending}
      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
    >
      {isPending ? (
        <>
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="hidden sm:inline">Connecting...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="hidden sm:inline">Connect Wallet</span>
          <span className="sm:hidden">Connect</span>
        </>
      )}
    </button>
  );
}
