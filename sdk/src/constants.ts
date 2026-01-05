// MNEE Token addresses on different chains
export const MNEE_ADDRESSES: Record<string, string> = {
  mainnet: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
  sepolia: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF', // Update with testnet address when deployed
  base: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF', // Update with Base address when deployed
  arbitrum: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF', // Update with Arbitrum address when deployed
  optimism: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF', // Update with Optimism address when deployed
  polygon: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF', // Update with Polygon address when deployed
};

// AgentPay Escrow contract addresses on different chains
export const ESCROW_ADDRESSES: Record<string, string> = {
  mainnet: '0x0000000000000000000000000000000000000000', // To be deployed
  sepolia: '0x0000000000000000000000000000000000000000', // To be deployed
  base: '0x0000000000000000000000000000000000000000', // To be deployed
  arbitrum: '0x0000000000000000000000000000000000000000', // To be deployed
  optimism: '0x0000000000000000000000000000000000000000', // To be deployed
  polygon: '0x0000000000000000000000000000000000000000', // To be deployed
};

// MNEE has 6 decimals (like USDC)
export const MNEE_DECIMALS = 6;

// Supported chains
export const SUPPORTED_CHAINS = [
  'mainnet',
  'sepolia',
  'base',
  'arbitrum',
  'optimism',
  'polygon',
] as const;

// Chain IDs
export const CHAIN_IDS: Record<string, number> = {
  mainnet: 1,
  sepolia: 11155111,
  base: 8453,
  arbitrum: 42161,
  optimism: 10,
  polygon: 137,
};
