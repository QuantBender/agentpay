import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("AgentPayEscrow", function () {
  // Fixture to deploy contract and set up test environment
  async function deployFixture() {
    const [owner, agent, provider, user] = await ethers.getSigners();

    // Deploy mock MNEE token for testing
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mnee = await MockERC20.deploy("MNEE Stablecoin", "MNEE", 6);
    await mnee.waitForDeployment();

    // Deploy AgentPayEscrow
    const AgentPayEscrow = await ethers.getContractFactory("AgentPayEscrow");
    const escrow = await AgentPayEscrow.deploy(await mnee.getAddress());
    await escrow.waitForDeployment();

    // Mint tokens for testing
    const mintAmount = ethers.parseUnits("10000", 6); // 10,000 MNEE
    await mnee.mint(owner.address, mintAmount);
    await mnee.mint(user.address, mintAmount);

    return { escrow, mnee, owner, agent, provider, user };
  }

  describe("Agent Management", function () {
    it("Should create an agent", async function () {
      const { escrow, agent, owner } = await loadFixture(deployFixture);
      
      const dailyLimit = ethers.parseUnits("100", 6); // 100 MNEE
      await escrow.createAgent(agent.address, "test-agent-1", dailyLimit);

      const agentData = await escrow.getAgent(agent.address);
      expect(agentData.owner).to.equal(owner.address);
      expect(agentData.dailyLimit).to.equal(dailyLimit);
      expect(agentData.isActive).to.be.true;
    });

    it("Should fund an agent", async function () {
      const { escrow, mnee, agent, owner } = await loadFixture(deployFixture);
      
      const dailyLimit = ethers.parseUnits("100", 6);
      const fundAmount = ethers.parseUnits("500", 6);
      
      await escrow.createAgent(agent.address, "test-agent-1", dailyLimit);
      await mnee.approve(await escrow.getAddress(), fundAmount);
      await escrow.fundAgent(agent.address, fundAmount);

      const agentData = await escrow.getAgent(agent.address);
      expect(agentData.balance).to.equal(fundAmount);
    });

    it("Should withdraw from agent", async function () {
      const { escrow, mnee, agent, owner } = await loadFixture(deployFixture);
      
      const dailyLimit = ethers.parseUnits("100", 6);
      const fundAmount = ethers.parseUnits("500", 6);
      const withdrawAmount = ethers.parseUnits("200", 6);
      
      await escrow.createAgent(agent.address, "test-agent-1", dailyLimit);
      await mnee.approve(await escrow.getAddress(), fundAmount);
      await escrow.fundAgent(agent.address, fundAmount);
      
      const balanceBefore = await mnee.balanceOf(owner.address);
      await escrow.withdrawFromAgent(agent.address, withdrawAmount);
      const balanceAfter = await mnee.balanceOf(owner.address);

      expect(balanceAfter - balanceBefore).to.equal(withdrawAmount);
    });
  });

  describe("Service Provider Management", function () {
    it("Should register a service provider", async function () {
      const { escrow, provider } = await loadFixture(deployFixture);
      
      const price = ethers.parseUnits("1", 6); // 1 MNEE per call
      await escrow.connect(provider).registerServiceProvider(
        "gpt-4-api",
        "GPT-4 API Service",
        price,
        "https://api.example.com/webhook"
      );

      const providerData = await escrow.getServiceProvider(provider.address);
      expect(providerData.serviceId).to.equal("gpt-4-api");
      expect(providerData.pricePerCall).to.equal(price);
      expect(providerData.isActive).to.be.true;
    });

    it("Should update webhook URL", async function () {
      const { escrow, provider } = await loadFixture(deployFixture);
      
      const price = ethers.parseUnits("1", 6);
      await escrow.connect(provider).registerServiceProvider(
        "gpt-4-api",
        "GPT-4 API Service",
        price,
        "https://api.example.com/webhook"
      );

      const newWebhook = "https://api.example.com/webhook/v2";
      await escrow.connect(provider).updateWebhookUrl(newWebhook);

      const providerData = await escrow.getServiceProvider(provider.address);
      expect(providerData.webhookUrl).to.equal(newWebhook);
    });
  });

  describe("Payment Execution", function () {
    it("Should execute a payment", async function () {
      const { escrow, mnee, agent, provider, owner } = await loadFixture(deployFixture);
      
      // Setup agent
      const dailyLimit = ethers.parseUnits("100", 6);
      const fundAmount = ethers.parseUnits("500", 6);
      await escrow.createAgent(agent.address, "test-agent-1", dailyLimit);
      await mnee.approve(await escrow.getAddress(), fundAmount);
      await escrow.fundAgent(agent.address, fundAmount);

      // Setup provider
      const price = ethers.parseUnits("10", 6);
      await escrow.connect(provider).registerServiceProvider(
        "gpt-4-api",
        "GPT-4 API Service",
        price,
        "https://api.example.com/webhook"
      );

      // Execute payment as agent
      const requestId = ethers.keccak256(ethers.toUtf8Bytes("request-1"));
      const providerBalanceBefore = await mnee.balanceOf(provider.address);
      
      await escrow.connect(agent).executePayment(provider.address, requestId);
      
      const providerBalanceAfter = await mnee.balanceOf(provider.address);
      expect(providerBalanceAfter - providerBalanceBefore).to.equal(price);

      const agentData = await escrow.getAgent(agent.address);
      expect(agentData.balance).to.equal(fundAmount - price);
      expect(agentData.spentToday).to.equal(price);
    });

    it("Should reject payment exceeding daily limit", async function () {
      const { escrow, mnee, agent, provider, owner } = await loadFixture(deployFixture);
      
      // Setup agent with low daily limit
      const dailyLimit = ethers.parseUnits("5", 6); // Only 5 MNEE
      const fundAmount = ethers.parseUnits("500", 6);
      await escrow.createAgent(agent.address, "test-agent-1", dailyLimit);
      await mnee.approve(await escrow.getAddress(), fundAmount);
      await escrow.fundAgent(agent.address, fundAmount);

      // Setup provider with higher price
      const price = ethers.parseUnits("10", 6); // 10 MNEE per call
      await escrow.connect(provider).registerServiceProvider(
        "gpt-4-api",
        "GPT-4 API Service",
        price,
        "https://api.example.com/webhook"
      );

      // Try to execute payment
      const requestId = ethers.keccak256(ethers.toUtf8Bytes("request-1"));
      await expect(
        escrow.connect(agent).executePayment(provider.address, requestId)
      ).to.be.revertedWithCustomError(escrow, "DailyLimitExceeded");
    });
  });

  describe("Analytics", function () {
    it("Should track payment history", async function () {
      const { escrow, mnee, agent, provider, owner } = await loadFixture(deployFixture);
      
      // Setup
      const dailyLimit = ethers.parseUnits("100", 6);
      const fundAmount = ethers.parseUnits("500", 6);
      await escrow.createAgent(agent.address, "test-agent-1", dailyLimit);
      await mnee.approve(await escrow.getAddress(), fundAmount);
      await escrow.fundAgent(agent.address, fundAmount);

      const price = ethers.parseUnits("10", 6);
      await escrow.connect(provider).registerServiceProvider(
        "gpt-4-api",
        "GPT-4 API Service",
        price,
        "https://api.example.com/webhook"
      );

      // Execute multiple payments
      for (let i = 0; i < 3; i++) {
        const requestId = ethers.keccak256(ethers.toUtf8Bytes(`request-${i}`));
        await escrow.connect(agent).executePayment(provider.address, requestId);
      }

      expect(await escrow.getAgentPaymentCount(agent.address)).to.equal(3);
      expect(await escrow.getProviderPaymentCount(provider.address)).to.equal(3);
      expect(await escrow.getAgentTotalSpent(agent.address)).to.equal(price * 3n);
      expect(await escrow.getProviderTotalEarned(provider.address)).to.equal(price * 3n);
    });
  });
});
