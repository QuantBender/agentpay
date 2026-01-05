'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, keccak256, toHex } from 'viem';
import { AGENT_PAY_ESCROW_ABI } from '@/contracts/escrow-abi';
import { AGENT_ESCROW_ADDRESS } from '@/config/wagmi';

const MNEE_DECIMALS = 6;

// Types
export interface Agent {
  owner: `0x${string}`;
  balance: bigint;
  dailyLimit: bigint;
  spentToday: bigint;
  periodStart: bigint;
  isActive: boolean;
  agentId: string;
}

export interface ServiceProvider {
  paymentAddress: `0x${string}`;
  pricePerCall: bigint;
  serviceId: string;
  serviceName: string;
  isActive: boolean;
}

// ============ Agent Hooks ============

export function useAgent(agentAddress?: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContract({
    address: AGENT_ESCROW_ADDRESS,
    abi: AGENT_PAY_ESCROW_ABI,
    functionName: 'getAgent',
    args: agentAddress ? [agentAddress] : undefined,
    query: {
      enabled: !!agentAddress && AGENT_ESCROW_ADDRESS !== '0x0000000000000000000000000000000000000000',
    },
  });

  const agent = data as Agent | undefined;

  return {
    agent,
    formattedBalance: agent?.balance ? formatUnits(agent.balance, MNEE_DECIMALS) : '0',
    formattedDailyLimit: agent?.dailyLimit ? formatUnits(agent.dailyLimit, MNEE_DECIMALS) : '0',
    formattedSpentToday: agent?.spentToday ? formatUnits(agent.spentToday, MNEE_DECIMALS) : '0',
    isLoading,
    refetch,
  };
}

export function useOwnerAgents(ownerAddress?: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContract({
    address: AGENT_ESCROW_ADDRESS,
    abi: AGENT_PAY_ESCROW_ABI,
    functionName: 'getOwnerAgents',
    args: ownerAddress ? [ownerAddress] : undefined,
    query: {
      enabled: !!ownerAddress && AGENT_ESCROW_ADDRESS !== '0x0000000000000000000000000000000000000000',
    },
  });

  return {
    agents: (data as `0x${string}`[]) || [],
    isLoading,
    refetch,
  };
}

export function useCreateAgent() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createAgent = async (
    agentAddress: `0x${string}`,
    agentId: string,
    dailyLimit: string
  ) => {
    const dailyLimitWei = parseUnits(dailyLimit, MNEE_DECIMALS);
    
    writeContract({
      address: AGENT_ESCROW_ADDRESS,
      abi: AGENT_PAY_ESCROW_ABI,
      functionName: 'createAgent',
      args: [agentAddress, agentId, dailyLimitWei],
    });
  };

  return {
    createAgent,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useFundAgent() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const fundAgent = async (agentAddress: `0x${string}`, amount: string) => {
    const amountWei = parseUnits(amount, MNEE_DECIMALS);
    
    writeContract({
      address: AGENT_ESCROW_ADDRESS,
      abi: AGENT_PAY_ESCROW_ABI,
      functionName: 'fundAgent',
      args: [agentAddress, amountWei],
    });
  };

  return {
    fundAgent,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useWithdrawFromAgent() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const withdraw = async (agentAddress: `0x${string}`, amount: string) => {
    const amountWei = parseUnits(amount, MNEE_DECIMALS);
    
    writeContract({
      address: AGENT_ESCROW_ADDRESS,
      abi: AGENT_PAY_ESCROW_ABI,
      functionName: 'withdrawFromAgent',
      args: [agentAddress, amountWei],
    });
  };

  return {
    withdraw,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useUpdateAgentLimit() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const updateLimit = async (agentAddress: `0x${string}`, newLimit: string) => {
    const limitWei = parseUnits(newLimit, MNEE_DECIMALS);
    
    writeContract({
      address: AGENT_ESCROW_ADDRESS,
      abi: AGENT_PAY_ESCROW_ABI,
      functionName: 'updateAgentLimit',
      args: [agentAddress, limitWei],
    });
  };

  return {
    updateLimit,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useToggleAgent() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const activate = async (agentAddress: `0x${string}`) => {
    writeContract({
      address: AGENT_ESCROW_ADDRESS,
      abi: AGENT_PAY_ESCROW_ABI,
      functionName: 'activateAgent',
      args: [agentAddress],
    });
  };

  const deactivate = async (agentAddress: `0x${string}`) => {
    writeContract({
      address: AGENT_ESCROW_ADDRESS,
      abi: AGENT_PAY_ESCROW_ABI,
      functionName: 'deactivateAgent',
      args: [agentAddress],
    });
  };

  return {
    activate,
    deactivate,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// ============ Service Provider Hooks ============

export function useServiceProvider(providerAddress?: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContract({
    address: AGENT_ESCROW_ADDRESS,
    abi: AGENT_PAY_ESCROW_ABI,
    functionName: 'getServiceProvider',
    args: providerAddress ? [providerAddress] : undefined,
    query: {
      enabled: !!providerAddress && AGENT_ESCROW_ADDRESS !== '0x0000000000000000000000000000000000000000',
    },
  });

  const provider = data as ServiceProvider | undefined;

  return {
    provider,
    formattedPrice: provider?.pricePerCall ? formatUnits(provider.pricePerCall, MNEE_DECIMALS) : '0',
    isLoading,
    refetch,
  };
}

export function useAllServiceProviders() {
  const { data, isLoading, refetch } = useReadContract({
    address: AGENT_ESCROW_ADDRESS,
    abi: AGENT_PAY_ESCROW_ABI,
    functionName: 'getAllServiceProviders',
    query: {
      enabled: AGENT_ESCROW_ADDRESS !== '0x0000000000000000000000000000000000000000',
    },
  });

  return {
    providers: (data as `0x${string}`[]) || [],
    isLoading,
    refetch,
  };
}

export function useRegisterServiceProvider() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const register = async (serviceId: string, serviceName: string, pricePerCall: string) => {
    const priceWei = parseUnits(pricePerCall, MNEE_DECIMALS);
    
    writeContract({
      address: AGENT_ESCROW_ADDRESS,
      abi: AGENT_PAY_ESCROW_ABI,
      functionName: 'registerServiceProvider',
      args: [serviceId, serviceName, priceWei],
    });
  };

  return {
    register,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// ============ Payment Hooks ============

export function useExecutePayment() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const executePayment = async (
    serviceProviderAddress: `0x${string}`,
    requestId?: string
  ) => {
    const requestIdBytes = requestId 
      ? keccak256(toHex(requestId))
      : keccak256(toHex(`${Date.now()}-${Math.random()}`));
    
    writeContract({
      address: AGENT_ESCROW_ADDRESS,
      abi: AGENT_PAY_ESCROW_ABI,
      functionName: 'executePayment',
      args: [serviceProviderAddress, requestIdBytes],
    });
  };

  return {
    executePayment,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useExecuteCustomPayment() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const executeCustomPayment = async (
    serviceProviderAddress: `0x${string}`,
    amount: string,
    requestId?: string
  ) => {
    const amountWei = parseUnits(amount, MNEE_DECIMALS);
    const requestIdBytes = requestId 
      ? keccak256(toHex(requestId))
      : keccak256(toHex(`${Date.now()}-${Math.random()}`));
    
    writeContract({
      address: AGENT_ESCROW_ADDRESS,
      abi: AGENT_PAY_ESCROW_ABI,
      functionName: 'executeCustomPayment',
      args: [serviceProviderAddress, amountWei, requestIdBytes],
    });
  };

  return {
    executeCustomPayment,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// ============ Utility Hooks ============

export function useAgentRemainingLimit(agentAddress?: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContract({
    address: AGENT_ESCROW_ADDRESS,
    abi: AGENT_PAY_ESCROW_ABI,
    functionName: 'getAgentRemainingDailyLimit',
    args: agentAddress ? [agentAddress] : undefined,
    query: {
      enabled: !!agentAddress && AGENT_ESCROW_ADDRESS !== '0x0000000000000000000000000000000000000000',
    },
  });

  return {
    remainingLimit: data ? formatUnits(data, MNEE_DECIMALS) : '0',
    rawRemainingLimit: data || BigInt(0),
    isLoading,
    refetch,
  };
}
