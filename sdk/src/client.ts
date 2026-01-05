import {
  createPublicClient,
  createWalletClient,
  http,
  type Address,
  type PublicClient,
  type WalletClient,
  type Chain,
  parseUnits,
  formatUnits,
  keccak256,
  toBytes,
  encodeFunctionData,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet, sepolia, base, arbitrum, optimism, polygon } from 'viem/chains';
import { ESCROW_ABI, ERC20_ABI } from './abi';
import { MNEE_ADDRESSES, ESCROW_ADDRESSES, MNEE_DECIMALS } from './constants';
import type {
  AgentPayConfig,
  Agent,
  ServiceProvider,
  Payment,
  PaymentResult,
  AgentStats,
} from './types';

/**
 * AgentPayClient - SDK for AI agents to interact with AgentPay escrow system
 * 
 * @example
 * ```typescript
 * const client = new AgentPayClient({
 *   privateKey: process.env.AGENT_PRIVATE_KEY,
 *   chain: 'mainnet',
 *   rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
 * });
 * 
 * // Execute payment to a service
 * const result = await client.executePayment({
 *   serviceProvider: '0x...',
 *   requestId: 'unique-request-id',
 * });
 * ```
 */
export class AgentPayClient {
  private publicClient: PublicClient;
  private walletClient: WalletClient;
  private chain: Chain;
  private escrowAddress: Address;
  private mneeAddress: Address;
  private agentAddress: Address;

  constructor(config: AgentPayConfig) {
    this.chain = this.getChain(config.chain);
    this.escrowAddress = (config.escrowAddress || ESCROW_ADDRESSES[config.chain]) as Address;
    this.mneeAddress = (config.mneeAddress || MNEE_ADDRESSES[config.chain]) as Address;

    const account = privateKeyToAccount(config.privateKey as `0x${string}`);
    this.agentAddress = account.address;

    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(config.rpcUrl),
    });

    this.walletClient = createWalletClient({
      account,
      chain: this.chain,
      transport: http(config.rpcUrl),
    });
  }

  private getChain(chainName: string): Chain {
    const chains: Record<string, Chain> = {
      mainnet,
      sepolia,
      base,
      arbitrum,
      optimism,
      polygon,
    };
    return chains[chainName] || mainnet;
  }

  /**
   * Get the agent's address
   */
  getAgentAddress(): Address {
    return this.agentAddress;
  }

  /**
   * Get agent information from the escrow contract
   */
  async getAgentInfo(): Promise<Agent> {
    const result = await this.publicClient.readContract({
      address: this.escrowAddress,
      abi: ESCROW_ABI,
      functionName: 'getAgent',
      args: [this.agentAddress],
    }) as any;

    return {
      owner: result.owner,
      balance: formatUnits(result.balance, MNEE_DECIMALS),
      dailyLimit: formatUnits(result.dailyLimit, MNEE_DECIMALS),
      spentToday: formatUnits(result.spentToday, MNEE_DECIMALS),
      periodStart: Number(result.periodStart),
      isActive: result.isActive,
      agentId: result.agentId,
    };
  }

  /**
   * Get remaining daily spending limit
   */
  async getRemainingDailyLimit(): Promise<string> {
    const result = await this.publicClient.readContract({
      address: this.escrowAddress,
      abi: ESCROW_ABI,
      functionName: 'getAgentRemainingDailyLimit',
      args: [this.agentAddress],
    }) as bigint;

    return formatUnits(result, MNEE_DECIMALS);
  }

  /**
   * Get service provider information
   */
  async getServiceProvider(providerAddress: Address): Promise<ServiceProvider> {
    const result = await this.publicClient.readContract({
      address: this.escrowAddress,
      abi: ESCROW_ABI,
      functionName: 'getServiceProvider',
      args: [providerAddress],
    }) as any;

    return {
      paymentAddress: result.paymentAddress,
      pricePerCall: formatUnits(result.pricePerCall, MNEE_DECIMALS),
      serviceId: result.serviceId,
      serviceName: result.serviceName,
      isActive: result.isActive,
      webhookUrl: result.webhookUrl,
    };
  }

  /**
   * Get all registered service providers
   */
  async getAllServiceProviders(): Promise<Address[]> {
    const result = await this.publicClient.readContract({
      address: this.escrowAddress,
      abi: ESCROW_ABI,
      functionName: 'getAllServiceProviders',
    }) as Address[];

    return result;
  }

  /**
   * Execute a payment to a service provider
   * 
   * @param params - Payment parameters
   * @returns Payment result with transaction hash and payment ID
   */
  async executePayment(params: {
    serviceProvider: Address;
    requestId: string;
  }): Promise<PaymentResult> {
    const requestIdHash = keccak256(toBytes(params.requestId));

    const { request } = await this.publicClient.simulateContract({
      address: this.escrowAddress,
      abi: ESCROW_ABI,
      functionName: 'executePayment',
      args: [params.serviceProvider, requestIdHash],
      account: this.walletClient.account,
    });

    const txHash = await this.walletClient.writeContract(request);

    // Wait for transaction confirmation
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    // Extract payment ID from logs
    const paymentLog = receipt.logs.find((log) => {
      try {
        return log.topics[0] === keccak256(toBytes('PaymentExecuted(bytes32,address,address,uint256,string,bytes32)'));
      } catch {
        return false;
      }
    });

    return {
      success: receipt.status === 'success',
      transactionHash: txHash,
      paymentId: paymentLog?.topics[1] || '0x',
      blockNumber: Number(receipt.blockNumber),
    };
  }

  /**
   * Execute a custom amount payment
   */
  async executeCustomPayment(params: {
    serviceProvider: Address;
    amount: string;
    requestId: string;
  }): Promise<PaymentResult> {
    const requestIdHash = keccak256(toBytes(params.requestId));
    const amountWei = parseUnits(params.amount, MNEE_DECIMALS);

    const { request } = await this.publicClient.simulateContract({
      address: this.escrowAddress,
      abi: ESCROW_ABI,
      functionName: 'executeCustomPayment',
      args: [params.serviceProvider, amountWei, requestIdHash],
      account: this.walletClient.account,
    });

    const txHash = await this.walletClient.writeContract(request);
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    return {
      success: receipt.status === 'success',
      transactionHash: txHash,
      paymentId: '0x',
      blockNumber: Number(receipt.blockNumber),
    };
  }

  /**
   * Check if agent can afford a payment
   */
  async canAffordPayment(serviceProvider: Address): Promise<{
    canAfford: boolean;
    reason?: string;
    price: string;
    balance: string;
    remainingLimit: string;
  }> {
    const [agent, provider, remainingLimit] = await Promise.all([
      this.getAgentInfo(),
      this.getServiceProvider(serviceProvider),
      this.getRemainingDailyLimit(),
    ]);

    const price = parseFloat(provider.pricePerCall);
    const balance = parseFloat(agent.balance);
    const limit = parseFloat(remainingLimit);

    let canAfford = true;
    let reason: string | undefined;

    if (!agent.isActive) {
      canAfford = false;
      reason = 'Agent is deactivated';
    } else if (!provider.isActive) {
      canAfford = false;
      reason = 'Service provider is not active';
    } else if (balance < price) {
      canAfford = false;
      reason = 'Insufficient balance';
    } else if (limit < price) {
      canAfford = false;
      reason = 'Daily limit exceeded';
    }

    return {
      canAfford,
      reason,
      price: provider.pricePerCall,
      balance: agent.balance,
      remainingLimit,
    };
  }

  /**
   * Get agent payment statistics
   */
  async getAgentStats(): Promise<AgentStats> {
    const [totalSpent, paymentCount, agentInfo] = await Promise.all([
      this.publicClient.readContract({
        address: this.escrowAddress,
        abi: ESCROW_ABI,
        functionName: 'getAgentTotalSpent',
        args: [this.agentAddress],
      }) as Promise<bigint>,
      this.publicClient.readContract({
        address: this.escrowAddress,
        abi: ESCROW_ABI,
        functionName: 'getAgentPaymentCount',
        args: [this.agentAddress],
      }) as Promise<bigint>,
      this.getAgentInfo(),
    ]);

    return {
      totalSpent: formatUnits(totalSpent, MNEE_DECIMALS),
      paymentCount: Number(paymentCount),
      currentBalance: agentInfo.balance,
      dailyLimit: agentInfo.dailyLimit,
      spentToday: agentInfo.spentToday,
      isActive: agentInfo.isActive,
    };
  }

  /**
   * Get payment history for the agent
   */
  async getPaymentHistory(): Promise<Payment[]> {
    const paymentIds = await this.publicClient.readContract({
      address: this.escrowAddress,
      abi: ESCROW_ABI,
      functionName: 'getAgentPaymentHistory',
      args: [this.agentAddress],
    }) as `0x${string}`[];

    const payments: Payment[] = [];
    for (const paymentId of paymentIds) {
      const payment = await this.publicClient.readContract({
        address: this.escrowAddress,
        abi: ESCROW_ABI,
        functionName: 'getPayment',
        args: [paymentId],
      }) as any;

      payments.push({
        paymentId,
        agent: payment.agent,
        serviceProvider: payment.serviceProvider,
        amount: formatUnits(payment.amount, MNEE_DECIMALS),
        timestamp: Number(payment.timestamp),
        serviceId: payment.serviceId,
        requestId: payment.requestId,
      });
    }

    return payments;
  }
}
