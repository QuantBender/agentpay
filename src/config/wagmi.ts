import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// MNEE Stablecoin Contract Address on Ethereum
export const MNEE_CONTRACT_ADDRESS = '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF' as const;

// AgentPay Escrow Contract (to be deployed)
export const AGENT_ESCROW_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

// Create wagmi config with injected wallets only (MetaMask, Brave, etc.)
// This uses the browser's injected provider directly
export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});

export { mainnet, sepolia };
