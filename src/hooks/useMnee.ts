'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { MNEE_ABI } from '@/contracts/mnee-abi';
import { MNEE_CONTRACT_ADDRESS } from '@/config/wagmi';

// MNEE has 6 decimals (like USDC)
const MNEE_DECIMALS = 6;

export function useMneeBalance(address?: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContract({
    address: MNEE_CONTRACT_ADDRESS,
    abi: MNEE_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    balance: data ? formatUnits(data, MNEE_DECIMALS) : '0',
    rawBalance: data || BigInt(0),
    isLoading,
    refetch,
  };
}

export function useMneeAllowance(owner?: `0x${string}`, spender?: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContract({
    address: MNEE_CONTRACT_ADDRESS,
    abi: MNEE_ABI,
    functionName: 'allowance',
    args: owner && spender ? [owner, spender] : undefined,
    query: {
      enabled: !!owner && !!spender,
    },
  });

  return {
    allowance: data ? formatUnits(data, MNEE_DECIMALS) : '0',
    rawAllowance: data || BigInt(0),
    isLoading,
    refetch,
  };
}

export function useMneeApprove() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = async (spender: `0x${string}`, amount: string) => {
    const amountInWei = parseUnits(amount, MNEE_DECIMALS);
    
    writeContract({
      address: MNEE_CONTRACT_ADDRESS,
      abi: MNEE_ABI,
      functionName: 'approve',
      args: [spender, amountInWei],
    });
  };

  const approveMax = async (spender: `0x${string}`) => {
    const maxAmount = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
    
    writeContract({
      address: MNEE_CONTRACT_ADDRESS,
      abi: MNEE_ABI,
      functionName: 'approve',
      args: [spender, maxAmount],
    });
  };

  return {
    approve,
    approveMax,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useMneeTransfer() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const transfer = async (to: `0x${string}`, amount: string) => {
    const amountInWei = parseUnits(amount, MNEE_DECIMALS);
    
    writeContract({
      address: MNEE_CONTRACT_ADDRESS,
      abi: MNEE_ABI,
      functionName: 'transfer',
      args: [to, amountInWei],
    });
  };

  return {
    transfer,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useMneeTokenInfo() {
  const { data: name } = useReadContract({
    address: MNEE_CONTRACT_ADDRESS,
    abi: MNEE_ABI,
    functionName: 'name',
  });

  const { data: symbol } = useReadContract({
    address: MNEE_CONTRACT_ADDRESS,
    abi: MNEE_ABI,
    functionName: 'symbol',
  });

  const { data: decimals } = useReadContract({
    address: MNEE_CONTRACT_ADDRESS,
    abi: MNEE_ABI,
    functionName: 'decimals',
  });

  const { data: totalSupply } = useReadContract({
    address: MNEE_CONTRACT_ADDRESS,
    abi: MNEE_ABI,
    functionName: 'totalSupply',
  });

  return {
    name: name as string | undefined,
    symbol: symbol as string | undefined,
    decimals: decimals as number | undefined,
    totalSupply: totalSupply ? formatUnits(totalSupply, MNEE_DECIMALS) : undefined,
  };
}

// Helper to parse MNEE amount
export function parseMneeAmount(amount: string): bigint {
  return parseUnits(amount, MNEE_DECIMALS);
}

// Helper to format MNEE amount
export function formatMneeAmount(amount: bigint): string {
  return formatUnits(amount, MNEE_DECIMALS);
}
