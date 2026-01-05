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
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet, sepolia, base, arbitrum, optimism, polygon } from 'viem/chains';
import { ESCROW_ABI, ERC20_ABI } from './abi';
import { MNEE_ADDRESSES, ESCROW_ADDRESSES, MNEE_DECIMALS } from './constants';
import type { AgentPayConfig, ServiceProvider, Payment, ProviderStats } from './types';

/**
 * AgentPayProvider - SDK for service providers to interact with AgentPay
 * 
 * @example
 * ```typescript
 * const provider = new AgentPayProvider({
 *   privateKey: process.env.PROVIDER_PRIVATE_KEY,
 *   chain: 'mainnet',
 *   rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
 * });
 * 
 * // Register as a service provider
 * await provider.register({
 *   serviceId: 'my-api',
 *   serviceName: 'My AI API Service',
 *   pricePerCall: '0.10', // $0.10 MNEE per call
 *   webhookUrl: 'https://myapi.com/webhook',
 * });
 * ```
 */
export class AgentPayProvider {
  private publicClient: PublicClient;
  private walletClient: WalletClient;
  private chain: Chain;
  private escrowAddress: Address;
  private mneeAddress: Address;
  private providerAddress: Address;

  constructor(config: AgentPayConfig) {
    this.chain = this.getChain(config.chain);
    this.escrowAddress = (config.escrowAddress || ESCROW_ADDRESSES[config.chain]) as Address;
    this.mneeAddress = (config.mneeAddress || MNEE_ADDRESSES[config.chain]) as Address;

    const account = privateKeyToAccount(config.privateKey as `0x${string}`);
    this.providerAddress = account.address;

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
   * Get the provider's address
   */
  getProviderAddress(): Address {
    return this.providerAddress;
  }

  /**
   * Register as a service provider
   */
  async register(params: {
    serviceId: string;
    serviceName: string;
    pricePerCall: string;
    webhookUrl: string;
  }): Promise<{ success: boolean; transactionHash: `0x${string}` }> {
    const priceWei = parseUnits(params.pricePerCall, MNEE_DECIMALS);

    const { request } = await this.publicClient.simulateContract({
      address: this.escrowAddress,
      abi: ESCROW_ABI,
      functionName: 'registerServiceProvider',
      args: [params.serviceId, params.serviceName, priceWei, params.webhookUrl],
      account: this.walletClient.account,
    });

    const txHash = await this.walletClient.writeContract(request);
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    return {
      success: receipt.status === 'success',
      transactionHash: txHash,
    };
  }

  /**
   * Get service provider information
   */
  async getInfo(): Promise<ServiceProvider> {
    const result = await this.publicClient.readContract({
      address: this.escrowAddress,
      abi: ESCROW_ABI,
      functionName: 'getServiceProvider',
      args: [this.providerAddress],
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
   * Update service price
   */
  async updatePrice(newPrice: string): Promise<{ success: boolean; transactionHash: `0x${string}` }> {
    const priceWei = parseUnits(newPrice, MNEE_DECIMALS);

    const { request } = await this.publicClient.simulateContract({
      address: this.escrowAddress,
      abi: ESCROW_ABI,
      functionName: 'updateServicePrice',
      args: [priceWei],
      account: this.walletClient.account,
    });

    const txHash = await this.walletClient.writeContract(request);
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    return {
      success: receipt.status === 'success',
      transactionHash: txHash,
    };
  }

  /**
   * Update webhook URL
   */
  async updateWebhookUrl(newWebhookUrl: string): Promise<{ success: boolean; transactionHash: `0x${string}` }> {
    const { request } = await this.publicClient.simulateContract({
      address: this.escrowAddress,
      abi: ESCROW_ABI,
      functionName: 'updateWebhookUrl',
      args: [newWebhookUrl],
      account: this.walletClient.account,
    });

    const txHash = await this.walletClient.writeContract(request);
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    return {
      success: receipt.status === 'success',
      transactionHash: txHash,
    };
  }

  /**
   * Deactivate service
   */
  async deactivate(): Promise<{ success: boolean; transactionHash: `0x${string}` }> {
    const { request } = await this.publicClient.simulateContract({
      address: this.escrowAddress,
      abi: ESCROW_ABI,
      functionName: 'deactivateService',
      account: this.walletClient.account,
    });

    const txHash = await this.walletClient.writeContract(request);
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    return {
      success: receipt.status === 'success',
      transactionHash: txHash,
    };
  }

  /**
   * Get provider statistics
   */
  async getStats(): Promise<ProviderStats> {
    const [totalEarned, paymentCount, providerInfo, mneeBalance] = await Promise.all([
      this.publicClient.readContract({
        address: this.escrowAddress,
        abi: ESCROW_ABI,
        functionName: 'getProviderTotalEarned',
        args: [this.providerAddress],
      }) as Promise<bigint>,
      this.publicClient.readContract({
        address: this.escrowAddress,
        abi: ESCROW_ABI,
        functionName: 'getProviderPaymentCount',
        args: [this.providerAddress],
      }) as Promise<bigint>,
      this.getInfo(),
      this.publicClient.readContract({
        address: this.mneeAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [this.providerAddress],
      }) as Promise<bigint>,
    ]);

    return {
      totalEarned: formatUnits(totalEarned, MNEE_DECIMALS),
      paymentCount: Number(paymentCount),
      currentBalance: formatUnits(mneeBalance, MNEE_DECIMALS),
      pricePerCall: providerInfo.pricePerCall,
      isActive: providerInfo.isActive,
    };
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(): Promise<Payment[]> {
    const paymentIds = await this.publicClient.readContract({
      address: this.escrowAddress,
      abi: ESCROW_ABI,
      functionName: 'getProviderPaymentHistory',
      args: [this.providerAddress],
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
