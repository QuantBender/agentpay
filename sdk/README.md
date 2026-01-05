# AgentPay SDK

Official SDK for integrating AI agents with the AgentPay payment system using MNEE stablecoin.

## Installation

```bash
npm install @agentpay/sdk
# or
yarn add @agentpay/sdk
# or
pnpm add @agentpay/sdk
```

## Quick Start

### For AI Agents

```typescript
import { AgentPayClient } from '@agentpay/sdk';

// Initialize the client
const client = new AgentPayClient({
  privateKey: process.env.AGENT_PRIVATE_KEY!,
  chain: 'mainnet',
  rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
});

// Check if you can afford a payment
const { canAfford, price } = await client.canAffordPayment('0xProviderAddress');

if (canAfford) {
  // Execute payment
  const result = await client.executePayment({
    serviceProvider: '0xProviderAddress',
    requestId: 'unique-request-id',
  });
  
  console.log(`Payment successful! TX: ${result.transactionHash}`);
}

// Get agent stats
const stats = await client.getAgentStats();
console.log(`Total spent: ${stats.totalSpent} MNEE`);
```

### For Service Providers

```typescript
import { AgentPayProvider, WebhookHandler } from '@agentpay/sdk';

// Initialize provider SDK
const provider = new AgentPayProvider({
  privateKey: process.env.PROVIDER_PRIVATE_KEY!,
  chain: 'mainnet',
  rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
});

// Register as a service provider
await provider.register({
  serviceId: 'gpt4-api',
  serviceName: 'GPT-4 API Service',
  pricePerCall: '0.10', // $0.10 MNEE per call
  webhookUrl: 'https://yourapi.com/webhook',
});

// Get provider stats
const stats = await provider.getStats();
console.log(`Total earned: ${stats.totalEarned} MNEE`);
```

### Handling Webhooks

```typescript
import { WebhookHandler } from '@agentpay/sdk';
import express from 'express';

const app = express();
app.use(express.json());

const webhookHandler = new WebhookHandler({
  secret: process.env.WEBHOOK_SECRET!,
});

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-agentpay-signature'] as string;
  const timestamp = req.headers['x-agentpay-timestamp'] as string;
  
  // Verify the webhook signature
  if (!webhookHandler.verify(req.body, signature, timestamp)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Parse the payload
  const payload = webhookHandler.parse(req.body);
  
  // Handle the payment
  console.log(`Payment received!`);
  console.log(`  Amount: ${payload.amount} MNEE`);
  console.log(`  From Agent: ${payload.agent}`);
  console.log(`  Request ID: ${payload.requestId}`);
  
  // Acknowledge receipt
  res.json({ received: true });
});
```

## API Reference

### AgentPayClient

Main client for AI agents to interact with AgentPay.

#### Constructor

```typescript
new AgentPayClient(config: AgentPayConfig)
```

#### Methods

- `getAgentAddress()` - Get the agent's address
- `getAgentInfo()` - Get agent information from contract
- `getRemainingDailyLimit()` - Get remaining daily spending limit
- `getServiceProvider(address)` - Get service provider info
- `getAllServiceProviders()` - Get all registered providers
- `executePayment(params)` - Execute a payment
- `executeCustomPayment(params)` - Execute payment with custom amount
- `canAffordPayment(serviceProvider)` - Check if agent can afford payment
- `getAgentStats()` - Get agent statistics
- `getPaymentHistory()` - Get payment history

### AgentPayProvider

Client for service providers.

#### Methods

- `register(params)` - Register as a service provider
- `getInfo()` - Get provider information
- `updatePrice(newPrice)` - Update service price
- `updateWebhookUrl(url)` - Update webhook URL
- `deactivate()` - Deactivate service
- `getStats()` - Get provider statistics
- `getPaymentHistory()` - Get payment history

### WebhookHandler

Utility for handling payment webhooks.

#### Methods

- `verify(payload, signature, timestamp)` - Verify webhook signature
- `parse(payload)` - Parse webhook payload
- `sign(payload, timestamp)` - Generate signature
- `generateHeaders(payload)` - Generate webhook headers

## Supported Chains

- Ethereum Mainnet
- Sepolia Testnet
- Base
- Arbitrum
- Optimism
- Polygon

## License

MIT
