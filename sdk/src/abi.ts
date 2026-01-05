export const ESCROW_ABI = [
  // Agent Management
  {
    inputs: [
      { name: 'agentAddress', type: 'address' },
      { name: 'agentId', type: 'string' },
      { name: 'dailyLimit', type: 'uint256' },
    ],
    name: 'createAgent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'agentAddress', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'fundAgent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'agentAddress', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'withdrawFromAgent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'agentAddress', type: 'address' },
      { name: 'newLimit', type: 'uint256' },
    ],
    name: 'updateAgentLimit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'agentAddress', type: 'address' }],
    name: 'deactivateAgent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'agentAddress', type: 'address' }],
    name: 'activateAgent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Service Provider Management
  {
    inputs: [
      { name: 'serviceId', type: 'string' },
      { name: 'serviceName', type: 'string' },
      { name: 'pricePerCall', type: 'uint256' },
      { name: 'webhookUrl', type: 'string' },
    ],
    name: 'registerServiceProvider',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'newPrice', type: 'uint256' }],
    name: 'updateServicePrice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'newWebhookUrl', type: 'string' }],
    name: 'updateWebhookUrl',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'deactivateService',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Payment Execution
  {
    inputs: [
      { name: 'serviceProviderAddress', type: 'address' },
      { name: 'requestId', type: 'bytes32' },
    ],
    name: 'executePayment',
    outputs: [{ name: 'paymentId', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'serviceProviderAddress', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'requestId', type: 'bytes32' },
    ],
    name: 'executeCustomPayment',
    outputs: [{ name: 'paymentId', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // View Functions
  {
    inputs: [{ name: 'agentAddress', type: 'address' }],
    name: 'getAgent',
    outputs: [
      {
        components: [
          { name: 'owner', type: 'address' },
          { name: 'balance', type: 'uint256' },
          { name: 'dailyLimit', type: 'uint256' },
          { name: 'spentToday', type: 'uint256' },
          { name: 'periodStart', type: 'uint256' },
          { name: 'isActive', type: 'bool' },
          { name: 'agentId', type: 'string' },
        ],
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'providerAddress', type: 'address' }],
    name: 'getServiceProvider',
    outputs: [
      {
        components: [
          { name: 'paymentAddress', type: 'address' },
          { name: 'pricePerCall', type: 'uint256' },
          { name: 'serviceId', type: 'string' },
          { name: 'serviceName', type: 'string' },
          { name: 'isActive', type: 'bool' },
          { name: 'webhookUrl', type: 'string' },
        ],
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'agentAddress', type: 'address' }],
    name: 'getAgentRemainingDailyLimit',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllServiceProviders',
    outputs: [{ type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'agentAddress', type: 'address' }],
    name: 'getAgentPaymentHistory',
    outputs: [{ type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'providerAddress', type: 'address' }],
    name: 'getProviderPaymentHistory',
    outputs: [{ type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'paymentId', type: 'bytes32' }],
    name: 'getPayment',
    outputs: [
      {
        components: [
          { name: 'agent', type: 'address' },
          { name: 'serviceProvider', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'serviceId', type: 'string' },
          { name: 'requestId', type: 'bytes32' },
        ],
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Analytics Functions
  {
    inputs: [{ name: 'agentAddress', type: 'address' }],
    name: 'getAgentTotalSpent',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'providerAddress', type: 'address' }],
    name: 'getProviderTotalEarned',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'agentAddress', type: 'address' }],
    name: 'getAgentPaymentCount',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'providerAddress', type: 'address' }],
    name: 'getProviderPaymentCount',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'paymentId', type: 'bytes32' },
      { indexed: true, name: 'agent', type: 'address' },
      { indexed: true, name: 'serviceProvider', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'serviceId', type: 'string' },
      { indexed: false, name: 'requestId', type: 'bytes32' },
    ],
    name: 'PaymentExecuted',
    type: 'event',
  },
] as const;

export const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
