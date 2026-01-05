// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentPayEscrow
 * @notice Escrow contract for AI Agent autonomous payments using MNEE stablecoin
 * @dev Enables agents to have budgets, spending limits, and automated service payments
 */
contract AgentPayEscrow is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // MNEE Stablecoin contract address on Ethereum mainnet
    IERC20 public immutable mneeToken;

    // Agent configuration
    struct Agent {
        address owner;           // Human owner of the agent
        uint256 balance;         // MNEE balance allocated to agent
        uint256 dailyLimit;      // Maximum daily spending
        uint256 spentToday;      // Amount spent in current period
        uint256 periodStart;     // Start of current spending period
        bool isActive;           // Whether agent can make payments
        string agentId;          // Unique identifier for the agent
    }

    // Service provider configuration
    struct ServiceProvider {
        address paymentAddress;   // Address to receive payments
        uint256 pricePerCall;     // Price per API call in MNEE (6 decimals)
        string serviceId;         // Unique service identifier
        string serviceName;       // Human readable name
        bool isActive;            // Whether service is available
    }

    // Payment record
    struct Payment {
        address agent;
        address serviceProvider;
        uint256 amount;
        uint256 timestamp;
        string serviceId;
        bytes32 requestId;
    }

    // Mappings
    mapping(address => Agent) public agents;
    mapping(address => ServiceProvider) public serviceProviders;
    mapping(bytes32 => Payment) public payments;
    
    // Agent addresses by owner
    mapping(address => address[]) public ownerAgents;
    
    // Service provider list
    address[] public serviceProviderList;
    
    // Events
    event AgentCreated(address indexed agentAddress, address indexed owner, string agentId);
    event AgentFunded(address indexed agentAddress, uint256 amount);
    event AgentWithdrawn(address indexed agentAddress, uint256 amount);
    event AgentLimitUpdated(address indexed agentAddress, uint256 newLimit);
    event AgentDeactivated(address indexed agentAddress);
    event AgentActivated(address indexed agentAddress);
    
    event ServiceProviderRegistered(address indexed provider, string serviceId, uint256 pricePerCall);
    event ServiceProviderUpdated(address indexed provider, uint256 newPrice);
    event ServiceProviderDeactivated(address indexed provider);
    
    event PaymentExecuted(
        bytes32 indexed paymentId,
        address indexed agent,
        address indexed serviceProvider,
        uint256 amount,
        string serviceId
    );

    // Errors
    error AgentAlreadyExists();
    error AgentNotFound();
    error AgentNotActive();
    error AgentNotOwner();
    error InsufficientAgentBalance();
    error DailyLimitExceeded();
    error ServiceNotFound();
    error ServiceNotActive();
    error InvalidAmount();
    error TransferFailed();

    constructor(address _mneeToken) Ownable(msg.sender) {
        mneeToken = IERC20(_mneeToken);
    }

    // ============ Agent Management ============

    /**
     * @notice Create a new AI agent with a spending budget
     * @param agentAddress The address that will act as the agent (can be a smart wallet)
     * @param agentId Unique identifier for the agent
     * @param dailyLimit Maximum amount agent can spend per day
     */
    function createAgent(
        address agentAddress,
        string calldata agentId,
        uint256 dailyLimit
    ) external {
        if (agents[agentAddress].owner != address(0)) revert AgentAlreadyExists();
        
        agents[agentAddress] = Agent({
            owner: msg.sender,
            balance: 0,
            dailyLimit: dailyLimit,
            spentToday: 0,
            periodStart: block.timestamp,
            isActive: true,
            agentId: agentId
        });
        
        ownerAgents[msg.sender].push(agentAddress);
        
        emit AgentCreated(agentAddress, msg.sender, agentId);
    }

    /**
     * @notice Fund an agent's balance with MNEE tokens
     * @param agentAddress The agent to fund
     * @param amount Amount of MNEE to deposit
     */
    function fundAgent(address agentAddress, uint256 amount) external nonReentrant {
        Agent storage agent = agents[agentAddress];
        if (agent.owner == address(0)) revert AgentNotFound();
        if (amount == 0) revert InvalidAmount();
        
        mneeToken.safeTransferFrom(msg.sender, address(this), amount);
        agent.balance += amount;
        
        emit AgentFunded(agentAddress, amount);
    }

    /**
     * @notice Withdraw MNEE from an agent's balance (owner only)
     * @param agentAddress The agent to withdraw from
     * @param amount Amount to withdraw
     */
    function withdrawFromAgent(address agentAddress, uint256 amount) external nonReentrant {
        Agent storage agent = agents[agentAddress];
        if (agent.owner != msg.sender) revert AgentNotOwner();
        if (agent.balance < amount) revert InsufficientAgentBalance();
        
        agent.balance -= amount;
        mneeToken.safeTransfer(msg.sender, amount);
        
        emit AgentWithdrawn(agentAddress, amount);
    }

    /**
     * @notice Update an agent's daily spending limit
     * @param agentAddress The agent to update
     * @param newLimit New daily limit
     */
    function updateAgentLimit(address agentAddress, uint256 newLimit) external {
        Agent storage agent = agents[agentAddress];
        if (agent.owner != msg.sender) revert AgentNotOwner();
        
        agent.dailyLimit = newLimit;
        
        emit AgentLimitUpdated(agentAddress, newLimit);
    }

    /**
     * @notice Deactivate an agent (owner only)
     */
    function deactivateAgent(address agentAddress) external {
        Agent storage agent = agents[agentAddress];
        if (agent.owner != msg.sender) revert AgentNotOwner();
        
        agent.isActive = false;
        
        emit AgentDeactivated(agentAddress);
    }

    /**
     * @notice Reactivate an agent (owner only)
     */
    function activateAgent(address agentAddress) external {
        Agent storage agent = agents[agentAddress];
        if (agent.owner != msg.sender) revert AgentNotOwner();
        
        agent.isActive = true;
        
        emit AgentActivated(agentAddress);
    }

    // ============ Service Provider Management ============

    /**
     * @notice Register as a service provider
     * @param serviceId Unique service identifier
     * @param serviceName Human readable service name
     * @param pricePerCall Price per API call in MNEE
     */
    function registerServiceProvider(
        string calldata serviceId,
        string calldata serviceName,
        uint256 pricePerCall
    ) external {
        serviceProviders[msg.sender] = ServiceProvider({
            paymentAddress: msg.sender,
            pricePerCall: pricePerCall,
            serviceId: serviceId,
            serviceName: serviceName,
            isActive: true
        });
        
        serviceProviderList.push(msg.sender);
        
        emit ServiceProviderRegistered(msg.sender, serviceId, pricePerCall);
    }

    /**
     * @notice Update service price
     */
    function updateServicePrice(uint256 newPrice) external {
        ServiceProvider storage provider = serviceProviders[msg.sender];
        if (bytes(provider.serviceId).length == 0) revert ServiceNotFound();
        
        provider.pricePerCall = newPrice;
        
        emit ServiceProviderUpdated(msg.sender, newPrice);
    }

    /**
     * @notice Deactivate service
     */
    function deactivateService() external {
        ServiceProvider storage provider = serviceProviders[msg.sender];
        if (bytes(provider.serviceId).length == 0) revert ServiceNotFound();
        
        provider.isActive = false;
        
        emit ServiceProviderDeactivated(msg.sender);
    }

    // ============ Payment Execution ============

    /**
     * @notice Execute a payment from agent to service provider
     * @dev Can be called by the agent address or through meta-transaction
     * @param serviceProviderAddress Address of the service provider
     * @param requestId Unique identifier for this request
     */
    function executePayment(
        address serviceProviderAddress,
        bytes32 requestId
    ) external nonReentrant returns (bytes32 paymentId) {
        Agent storage agent = agents[msg.sender];
        if (agent.owner == address(0)) revert AgentNotFound();
        if (!agent.isActive) revert AgentNotActive();
        
        ServiceProvider storage provider = serviceProviders[serviceProviderAddress];
        if (bytes(provider.serviceId).length == 0) revert ServiceNotFound();
        if (!provider.isActive) revert ServiceNotActive();
        
        uint256 amount = provider.pricePerCall;
        
        // Check daily limit (reset if new day)
        if (block.timestamp >= agent.periodStart + 1 days) {
            agent.spentToday = 0;
            agent.periodStart = block.timestamp;
        }
        
        if (agent.spentToday + amount > agent.dailyLimit) revert DailyLimitExceeded();
        if (agent.balance < amount) revert InsufficientAgentBalance();
        
        // Execute payment
        agent.balance -= amount;
        agent.spentToday += amount;
        
        paymentId = keccak256(abi.encodePacked(msg.sender, serviceProviderAddress, requestId, block.timestamp));
        
        payments[paymentId] = Payment({
            agent: msg.sender,
            serviceProvider: serviceProviderAddress,
            amount: amount,
            timestamp: block.timestamp,
            serviceId: provider.serviceId,
            requestId: requestId
        });
        
        mneeToken.safeTransfer(provider.paymentAddress, amount);
        
        emit PaymentExecuted(paymentId, msg.sender, serviceProviderAddress, amount, provider.serviceId);
        
        return paymentId;
    }

    /**
     * @notice Execute payment with custom amount (for variable pricing)
     */
    function executeCustomPayment(
        address serviceProviderAddress,
        uint256 amount,
        bytes32 requestId
    ) external nonReentrant returns (bytes32 paymentId) {
        Agent storage agent = agents[msg.sender];
        if (agent.owner == address(0)) revert AgentNotFound();
        if (!agent.isActive) revert AgentNotActive();
        
        ServiceProvider storage provider = serviceProviders[serviceProviderAddress];
        if (bytes(provider.serviceId).length == 0) revert ServiceNotFound();
        if (!provider.isActive) revert ServiceNotActive();
        
        // Check daily limit (reset if new day)
        if (block.timestamp >= agent.periodStart + 1 days) {
            agent.spentToday = 0;
            agent.periodStart = block.timestamp;
        }
        
        if (agent.spentToday + amount > agent.dailyLimit) revert DailyLimitExceeded();
        if (agent.balance < amount) revert InsufficientAgentBalance();
        
        // Execute payment
        agent.balance -= amount;
        agent.spentToday += amount;
        
        paymentId = keccak256(abi.encodePacked(msg.sender, serviceProviderAddress, requestId, block.timestamp));
        
        payments[paymentId] = Payment({
            agent: msg.sender,
            serviceProvider: serviceProviderAddress,
            amount: amount,
            timestamp: block.timestamp,
            serviceId: provider.serviceId,
            requestId: requestId
        });
        
        mneeToken.safeTransfer(provider.paymentAddress, amount);
        
        emit PaymentExecuted(paymentId, msg.sender, serviceProviderAddress, amount, provider.serviceId);
        
        return paymentId;
    }

    // ============ View Functions ============

    function getAgent(address agentAddress) external view returns (Agent memory) {
        return agents[agentAddress];
    }

    function getServiceProvider(address providerAddress) external view returns (ServiceProvider memory) {
        return serviceProviders[providerAddress];
    }

    function getOwnerAgents(address owner) external view returns (address[] memory) {
        return ownerAgents[owner];
    }

    function getServiceProviderCount() external view returns (uint256) {
        return serviceProviderList.length;
    }

    function getAllServiceProviders() external view returns (address[] memory) {
        return serviceProviderList;
    }

    function getAgentRemainingDailyLimit(address agentAddress) external view returns (uint256) {
        Agent storage agent = agents[agentAddress];
        if (agent.owner == address(0)) return 0;
        
        // Reset if new day
        if (block.timestamp >= agent.periodStart + 1 days) {
            return agent.dailyLimit;
        }
        
        if (agent.spentToday >= agent.dailyLimit) return 0;
        return agent.dailyLimit - agent.spentToday;
    }
}
