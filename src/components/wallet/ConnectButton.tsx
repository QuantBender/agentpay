'use client';

import { useAccount, useConnect, useDisconnect, useEnsName, useBalance } from 'wagmi';
import { useState, useEffect } from 'react';
import { formatUnits } from 'viem';

export function ConnectButton() {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: balance } = useBalance({ address });
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showConnectorList, setShowConnectorList] = useState(false);

  // Wait for client-side mount to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if we're in an environment with no wallet
  const hasWallet = typeof window !== 'undefined' && (
    window.ethereum !== undefined || 
    connectors.some(c => c.ready !== false)
  );

  // Format balance properly
  const formattedBalance = balance 
    ? parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)
    : '0';

  // Show loading placeholder during SSR
  if (!mounted) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-700 rounded-lg font-medium flex items-center gap-2"
      >
        <span className="hidden sm:inline">Connect Wallet</span>
        <span className="sm:hidden">Connect</span>
      </button>
    );
  }

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

  const handleConnect = () => {
    if (!hasWallet) {
      // Open MetaMask download page in new tab
      window.open('https://metamask.io/download/', '_blank');
      return;
    }
    
    if (connectors.length > 1) {
      setShowConnectorList(true);
    } else if (preferredConnector) {
      connect({ connector: preferredConnector });
    } else if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  // No wallet installed - show install button
  if (!hasWallet) {
    return (
      <a
        href="https://metamask.io/download/"
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.3 6.9l-9-5.2c-.2-.1-.4-.1-.6 0l-9 5.2c-.2.1-.3.3-.3.5v10.2c0 .2.1.4.3.5l9 5.2c.1.1.2.1.3.1s.2 0 .3-.1l9-5.2c.2-.1.3-.3.3-.5V7.4c0-.2-.1-.4-.3-.5zM12 4.2l6.5 3.8L12 11.7 5.5 8l6.5-3.8zm-7 5.1l6 3.5v7l-6-3.5v-7zm8 10.5v-7l6-3.5v7l-6 3.5z"/>
        </svg>
        <span className="hidden sm:inline">Install Wallet</span>
        <span className="sm:hidden">Install</span>
      </a>
    );
  }

  return (
    <div className="relative flex flex-col items-end">
      <button
        onClick={handleConnect}
        disabled={isPending}
        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2"
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
      
      {/* Connector selection dropdown */}
      {showConnectorList && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowConnectorList(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50">
            <div className="p-2">
              <p className="px-3 py-2 text-xs text-gray-400 font-medium">Select Wallet</p>
              {connectors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    connect({ connector: c });
                    setShowConnectorList(false);
                  }}
                  className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-xs">
                    🦊
                  </div>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      
      {error && (
        <p className="text-xs text-red-400 mt-1 max-w-[200px] truncate" title={error.message}>
          {error.message.includes('rejected') ? 'Connection rejected' : 
           error.message.includes('provider') ? 'No wallet found' : 'Connection failed'}
        </p>
      )}
    </div>
  );
}
