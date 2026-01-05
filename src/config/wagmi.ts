import { http, createConfig } from 'wagmi';
import { mainnet, sepolia, base, arbitrum, optimism, polygon } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// MNEE Stablecoin Contract Address on Ethereum
export const MNEE_CONTRACT_ADDRESS = '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF' as const;

// Default escrow address (use chain-specific when available)
export const AGENT_ESCROW_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

// AgentPay Escrow Contract addresses per chain (to be deployed)
export const ESCROW_ADDRESSES: Record<number, `0x${string}`> = {
  [mainnet.id]: '0x0000000000000000000000000000000000000000',
  [sepolia.id]: '0x0000000000000000000000000000000000000000',
  [base.id]: '0x0000000000000000000000000000000000000000',
  [arbitrum.id]: '0x0000000000000000000000000000000000000000',
  [optimism.id]: '0x0000000000000000000000000000000000000000',
  [polygon.id]: '0x0000000000000000000000000000000000000000',
} as const;

// MNEE Token addresses per chain
export const MNEE_ADDRESSES: Record<number, `0x${string}`> = {
  [mainnet.id]: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
  [sepolia.id]: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
  [base.id]: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
  [arbitrum.id]: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
  [optimism.id]: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
  [polygon.id]: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
} as const;

// Create wagmi config with injected wallets only (MetaMask, Brave, etc.)
// Multi-chain support: Ethereum, Base, Arbitrum, Optimism, Polygon
export const config = createConfig({
  chains: [mainnet, sepolia, base, arbitrum, optimism, polygon],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
  },
  ssr: true,
});

// Export all supported chains
export { mainnet, sepolia, base, arbitrum, optimism, polygon };

// Chain metadata for UI
export const SUPPORTED_CHAINS = [
  { id: mainnet.id, name: 'Ethereum', icon: '⟠' },
  { id: sepolia.id, name: 'Sepolia', icon: '🧪' },
  { id: base.id, name: 'Base', icon: '🔵' },
  { id: arbitrum.id, name: 'Arbitrum', icon: '🔷' },
  { id: optimism.id, name: 'Optimism', icon: '🔴' },
  { id: polygon.id, name: 'Polygon', icon: '💜' },
] as const;
