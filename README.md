# AgentPay - Autonomous AI Payments with MNEE

<div align="center">
  <h3>🤖 Enable AI agents to transact autonomously using MNEE stablecoin</h3>
  <p>Built for the MNEE Hackathon: Programmable Money for Agents, Commerce, and Automated Finance</p>
</div>

---

## 📖 About the Project

### 💡 Inspiration

The rise of autonomous AI agents—from GPT-4 powered assistants to fully autonomous research agents—creates a fundamental problem: **how do machines pay for services?**

Today, AI agents can browse the web, write code, and make decisions, but they hit a wall when they need to pay for an API call, purchase data, or compensate another agent for work. We asked ourselves:

> *What if AI agents could have their own wallets, budgets, and the ability to transact—all while their human owners maintain control?*

The MNEE stablecoin, with its programmable money capabilities, provided the perfect foundation. We envisioned a future where:

- An AI research agent pays $0.001 per API call automatically
- Agent-to-agent commerce becomes seamless (Agent A pays Agent B for a completed task)
- Humans set budgets and limits, but agents operate autonomously within those bounds

This is the **agentic economy**—and AgentPay is the payment infrastructure to power it.

### 🧠 What We Learned

Building AgentPay taught us invaluable lessons across multiple domains:

**1. Smart Contract Economics**

Designing the escrow system required balancing security with flexibility. We learned that the optimal daily spending limit follows a decay function:

$$L_{effective} = L_{max} \cdot e^{-\lambda \cdot t_{inactive}}$$

Where $L_{max}$ is the maximum daily limit, $\lambda$ is the decay rate, and $t_{inactive}$ is time since last human interaction. This ensures dormant agents gradually lose spending power.

**2. Web3 + Next.js Integration Challenges**

SSR (Server-Side Rendering) and Web3 don't mix well. Wallet state exists only on the client, leading to hydration mismatches. We solved this with:
- Lazy client-side mounting for wallet components
- `useState` initialization for QueryClient to avoid SSR conflicts
- Graceful degradation when no wallet is detected

**3. Multi-Chain Complexity**

Supporting 6 chains (Ethereum, Base, Arbitrum, Optimism, Polygon, Sepolia) meant managing:
- Different RPC endpoints and latencies
- Chain-specific contract addresses
- Gas price variations (L2s are ~100x cheaper)

**4. Agent UX is Different**

Designing for AI agents as users is fundamentally different from human UX. Agents need:
- Deterministic API responses (no ambiguous UI states)
- Webhook callbacks for async operations
- Structured error codes, not human-readable messages

### 🔨 How We Built It

**Tech Stack:**
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Web3**: wagmi v3, viem, custom injected wallet connector
- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin
- **State Management**: TanStack Query for server state

**Architecture Decisions:**

1. **Escrow-First Design**: Instead of giving agents direct wallet access, all funds flow through an escrow contract. This provides:
   - Daily spending limits enforced on-chain
   - Human override capabilities (pause, withdraw)
   - Audit trail of all agent transactions

2. **Provider Registry**: Service providers register on-chain with their pricing, enabling agents to discover and compare services programmatically.

3. **SDK-First Approach**: We built the `@agentpay/sdk` package so AI agent frameworks (LangChain, AutoGPT, CrewAI) can integrate payments in ~5 lines of code:

```typescript
import { AgentPayClient } from '@agentpay/sdk';

const client = new AgentPayClient({ 
  agentId: 'agent-001',
  escrowAddress: '0x...' 
});

await client.payForService('weather-api', 0.001);
```

4. **Webhook System**: Providers receive real-time payment notifications, enabling instant service delivery upon payment confirmation.

### ⚡ Challenges We Faced

**Challenge 1: Wallet Connection Hell**

We initially used RainbowKit + WalletConnect, but dependency conflicts with Next.js 15 caused build failures. The `@walletconnect/ethereum-provider` package had peer dependency issues with `viem` versions.

*Solution*: Built a custom `ConnectButton` using raw wagmi hooks, supporting only injected wallets (MetaMask, Brave, etc.). Simpler, but rock-solid.

**Challenge 2: Hydration Mismatches**

React 18's strict hydration checking flagged our wallet components because `window.ethereum` doesn't exist on the server.

*Solution*: Implemented a `mounted` state pattern:
```typescript
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <Skeleton />;
```

**Challenge 3: Gas Estimation for Agent Transactions**

Agents need predictable costs, but gas prices fluctuate. An agent budgeting $1 for 100 API calls could run out after 50 if gas spikes.

*Solution*: We recommend L2 deployment (Base/Arbitrum) where gas is ~$0.001 per transaction, making costs negligible. Our SDK includes gas estimation helpers:

$$Cost_{total} = Cost_{service} + Gas_{price} \cdot Gas_{limit}$$

**Challenge 4: Trust Without Custody**

How do you let an agent spend money without giving it full wallet access? Our escrow contract solves this:
- Human deposits funds and sets daily limit
- Agent can only spend up to the limit per day
- Human can pause or withdraw at any time
- All transactions are logged on-chain

**Challenge 5: Multi-Chain State Sync**

When a user switches chains, the entire app state (balances, contracts, transactions) must update. We used wagmi's `useChainId` hook with reactive queries:

```typescript
const { data: balance } = useBalance({ 
  address, 
  chainId, // Reactive to chain changes
  watch: true 
});
```

---

## 🎯 Overview

AgentPay is a platform that enables AI agents to make autonomous payments for services, APIs, and data using MNEE stablecoin on Ethereum. It provides:

- **Agent Wallet Management**: Create and fund AI agent wallets with spending limits
- **Escrow System**: Secure smart contract holding agent funds with daily limits
- **Service Marketplace**: Discover and integrate AI-accessible services
- **Real-time Dashboard**: Monitor agent transactions and manage budgets

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   AI Agent      │────▶│  AgentPay Escrow │────▶│ Service Provider│
│  (GPT-4, etc)   │     │  Smart Contract  │     │     (APIs)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │                        │
        │                        ▼                        │
        │               ┌──────────────────┐              │
        └──────────────▶│  MNEE Stablecoin │◀─────────────┘
                        │    (ERC-20)      │
                        └──────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- A Web3 wallet (MetaMask, Rainbow, etc.)

### Installation

\`\`\`bash
# Clone the repository
cd agentpay

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

Create a \`.env.local\` file:

\`\`\`env
NEXT_PUBLIC_WALLET_CONNECT_ID=your_project_id_here
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key_here
\`\`\`

Get a WalletConnect Project ID at [https://cloud.walletconnect.com](https://cloud.walletconnect.com)

## 📦 Project Structure

```
agentpay/
├── public/                     # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Home/Dashboard
│   │   ├── globals.css        # Global styles & Tailwind
│   │   ├── favicon.ico        # App favicon
│   │   ├── agents/
│   │   │   └── page.tsx       # Agent management page
│   │   ├── marketplace/
│   │   │   └── page.tsx       # Service marketplace page
│   │   └── provider/
│   │       └── page.tsx       # Service provider registration
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx     # Navigation header with mobile menu
│   │   │   └── Footer.tsx     # Site footer
│   │   ├── providers/
│   │   │   └── Web3Provider.tsx  # wagmi & QueryClient provider
│   │   └── wallet/
│   │       └── ConnectButton.tsx # Custom wallet connect button
│   ├── config/
│   │   └── wagmi.ts           # Wagmi configuration (injected connector)
│   ├── contracts/
│   │   ├── AgentPayEscrow.sol # Solidity escrow contract
│   │   ├── mnee-abi.ts        # MNEE ERC-20 ABI
│   │   └── escrow-abi.ts      # Escrow contract ABI
│   └── hooks/
│       ├── useMnee.ts         # MNEE token hooks (balance, approve, transfer)
│       └── useAgentPay.ts     # Escrow contract hooks (create, fund, execute)
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── eslint.config.mjs          # ESLint configuration
├── next.config.ts             # Next.js configuration
├── next-env.d.ts              # Next.js TypeScript declarations
├── package.json               # Dependencies and scripts
├── postcss.config.mjs         # PostCSS configuration
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Project documentation
```

## 🔐 Smart Contracts

### MNEE Stablecoin
- **Address**: \`0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF\`
- **Network**: Ethereum Mainnet
- **Type**: ERC-20 USD-backed stablecoin

### AgentPay Escrow Contract

The escrow contract (\`src/contracts/AgentPayEscrow.sol\`) handles:

- Agent creation with daily spending limits
- Secure fund deposits and withdrawals
- Automated payment execution
- Service provider registration

**Key Functions:**
- \`createAgent(address, agentId, dailyLimit)\` - Register a new agent
- \`fundAgent(address, amount)\` - Deposit MNEE to agent
- \`executePayment(serviceProvider, requestId)\` - Process payment
- \`registerServiceProvider(serviceId, name, price)\` - Register as provider

## 🎨 Features

### For Agent Owners
- Create and manage multiple AI agents
- Set daily spending limits
- Fund agents with MNEE stablecoin
- Monitor transactions in real-time
- Pause/resume agent activity

### For Service Providers
- Register APIs and services
- Set custom pricing per call
- Receive instant MNEE payments
- Track service usage analytics

### For AI Agents
- Autonomous service payments
- Budget-constrained spending
- On-chain payment verification
- Multi-service integration

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Web3**: wagmi, viem (with injected wallet connector)
- **Blockchain**: Ethereum, MNEE Stablecoin
- **Smart Contracts**: Solidity 0.8.20, OpenZeppelin

## 📝 Usage Examples

### Creating an Agent (TypeScript)

\`\`\`typescript
import { useCreateAgent, useFundAgent } from '@/hooks/useAgentPay';
import { useMneeApprove } from '@/hooks/useMnee';

const { createAgent } = useCreateAgent();
const { fundAgent } = useFundAgent();
const { approve } = useMneeApprove();

// 1. Create agent
await createAgent(agentWalletAddress, 'my-ai-agent', '100'); // $100/day limit

// 2. Approve MNEE spending
await approve(ESCROW_ADDRESS, '500');

// 3. Fund agent
await fundAgent(agentWalletAddress, '500'); // $500 initial funding
\`\`\`

### Making a Payment (Agent-side)

\`\`\`typescript
import { useExecutePayment } from '@/hooks/useAgentPay';

const { executePayment } = useExecutePayment();

// Execute payment to service provider
await executePayment(serviceProviderAddress, 'unique-request-id');
\`\`\`

## 🗺️ Roadmap

### ✅ Phase 1: Foundation (Completed - 2026 Q1)
- [x] Core escrow smart contract
- [x] Agent wallet management UI
- [x] Service marketplace
- [x] Provider registration
- [x] Deploy contracts to testnet/mainnet (Hardhat setup complete)
- [x] Agent SDK for easy integration (`/sdk` package)
- [x] Payment webhooks for providers (`/api/webhooks`)
- [x] Multi-chain support (Base, Arbitrum, Optimism, Polygon)
- [x] Agent analytics dashboard (`/analytics` page)

### 🔄 Phase 2: Production Ready (2026 Q2-Q4)
- [ ] Smart contract security audit
- [ ] Deploy contracts to production (mainnet + L2s)
- [ ] Real-time payment notifications
- [ ] Agent API rate limiting & quotas
- [ ] Production-grade error handling
- [ ] Comprehensive documentation & tutorials
- [ ] Mobile-responsive improvements
- [ ] Integration testing suite

### 🚀 Phase 3: Scale & Growth (2027)
- [ ] Agent marketplace discovery & ratings
- [ ] Subscription-based payment models
- [ ] Batch payment processing
- [ ] Cross-chain atomic payments
- [ ] Agent reputation system
- [ ] Provider verification badges
- [ ] Usage-based billing tiers
- [ ] White-label SDK options

### 🌐 Phase 4: Ecosystem Expansion (2028)
- [ ] DAO governance for platform decisions
- [ ] Native mobile apps (iOS/Android)
- [ ] Enterprise API tier
- [ ] AI agent templates & marketplace
- [ ] Fiat on/off ramp integration
- [ ] Multi-currency stablecoin support
- [ ] Agent-to-agent payment protocol
- [ ] Third-party plugin ecosystem

### 🔮 Phase 5: AI-Native Finance (2029-2030)
- [ ] Autonomous agent credit lines
- [ ] AI-powered fraud detection
- [ ] Predictive budget management
- [ ] Decentralized agent identity (DID)
- [ ] Zero-knowledge payment proofs
- [ ] Intent-based transaction routing
- [ ] Cross-protocol liquidity aggregation
- [ ] Global compliance framework

### 🌟 Long-term Vision (2030+)
- [ ] Full agentic finance stack
- [ ] Universal agent payment standard
- [ ] Regulatory-compliant agent banking
- [ ] AI treasury management
- [ ] Programmable money for IoT & robotics

## 🚀 Deployment

### Deploy Smart Contracts

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Deploy to testnet (Sepolia)
npm run deploy:sepolia

# Deploy to mainnet
npm run deploy:mainnet

# Deploy to L2s
npm run deploy:base
npm run deploy:arbitrum
npm run deploy:optimism
npm run deploy:polygon
```

### Using the SDK

```bash
# Install SDK in your project
npm install @agentpay/sdk

# For AI Agents
import { AgentPayClient } from '@agentpay/sdk';

const client = new AgentPayClient({
  privateKey: process.env.AGENT_PRIVATE_KEY,
  chain: 'base', // or 'mainnet', 'arbitrum', etc.
  rpcUrl: process.env.RPC_URL,
});

// Execute payment
await client.executePayment({
  serviceProvider: '0x...',
  requestId: 'unique-id',
});
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Links

- [MNEE Stablecoin](https://mnee.io)
- [MNEE Contract on Etherscan](https://etherscan.io/address/0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF)
- [MNEE Hackathon](https://mnee-eth.devpost.com)

---

<div align="center">
  <p>Built with ❤️ for the MNEE Hackathon 2026</p>
  <p><strong>Programmable Money for Agents, Commerce, and Automated Finance</strong></p>
</div>
