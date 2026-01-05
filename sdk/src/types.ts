import type { Address } from 'viem';

export interface AgentPayConfig {
  /**
   * Private key for signing transactions (with 0x prefix)
   */
  privateKey: string;
  
  /**
   * Chain to connect to
   */
  chain: 'mainnet' | 'sepolia' | 'base' | 'arbitrum' | 'optimism' | 'polygon';
  
  /**
   * RPC URL for the chain
   */
  rpcUrl: string;
  
  /**
   * Optional custom escrow contract address
   */
  escrowAddress?: string;
  
  /**
   * Optional custom MNEE token address
   */
  mneeAddress?: string;
}

export interface Agent {
  owner: Address;
  balance: string;
  dailyLimit: string;
  spentToday: string;
  periodStart: number;
  isActive: boolean;
  agentId: string;
}

export interface ServiceProvider {
  paymentAddress: Address;
  pricePerCall: string;
  serviceId: string;
  serviceName: string;
  isActive: boolean;
  webhookUrl: string;
}

export interface Payment {
  paymentId: `0x${string}`;
  agent: Address;
  serviceProvider: Address;
  amount: string;
  timestamp: number;
  serviceId: string;
  requestId: `0x${string}`;
}

export interface PaymentResult {
  success: boolean;
  transactionHash: `0x${string}`;
  paymentId: `0x${string}` | string;
  blockNumber: number;
}

export interface AgentStats {
  totalSpent: string;
  paymentCount: number;
  currentBalance: string;
  dailyLimit: string;
  spentToday: string;
  isActive: boolean;
}

export interface ProviderStats {
  totalEarned: string;
  paymentCount: number;
  currentBalance: string;
  pricePerCall: string;
  isActive: boolean;
}

export interface WebhookPayload {
  event: 'payment.received';
  paymentId: string;
  agent: Address;
  amount: string;
  serviceId: string;
  requestId: string;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
}

export interface WebhookConfig {
  /**
   * Secret key for verifying webhook signatures
   */
  secret: string;
  
  /**
   * Tolerance for timestamp validation (in seconds)
   */
  timestampTolerance?: number;
}
