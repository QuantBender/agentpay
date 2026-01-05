import { ethers, network, run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

// MNEE Token addresses on different chains
const MNEE_ADDRESSES: Record<string, string> = {
  mainnet: "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF",
  sepolia: "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF", // Update with testnet address
  base: "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF", // Update with Base address
  baseSepolia: "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF", // Update with Base Sepolia address
  arbitrum: "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF", // Update with Arbitrum address
  arbitrumSepolia: "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF", // Update with Arbitrum Sepolia address
  optimism: "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF", // Update with Optimism address
  optimismSepolia: "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF", // Update with Optimism Sepolia address
  polygon: "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF", // Update with Polygon address
  polygonAmoy: "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF", // Update with Polygon Amoy address
  hardhat: "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF",
  localhost: "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF",
};

async function main() {
  const networkName = network.name;
  console.log(`\n🚀 Deploying AgentPayEscrow to ${networkName}...\n`);

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log(`📍 Deployer: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

  // Get MNEE address for this network
  const mneeAddress = MNEE_ADDRESSES[networkName];
  if (!mneeAddress) {
    throw new Error(`MNEE address not configured for network: ${networkName}`);
  }
  console.log(`📄 MNEE Token: ${mneeAddress}`);

  // Deploy contract
  console.log(`\n⏳ Deploying contract...`);
  const AgentPayEscrow = await ethers.getContractFactory("AgentPayEscrow");
  const escrow = await AgentPayEscrow.deploy(mneeAddress);
  
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  
  console.log(`✅ AgentPayEscrow deployed to: ${escrowAddress}\n`);

  // Save deployment info
  const deploymentInfo = {
    network: networkName,
    chainId: network.config.chainId,
    escrowAddress: escrowAddress,
    mneeAddress: mneeAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentPath = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📁 Deployment info saved to: ${deploymentPath}`);

  // Verify contract on block explorers (skip for local networks)
  if (networkName !== "hardhat" && networkName !== "localhost") {
    console.log(`\n⏳ Waiting for block confirmations...`);
    // Wait for a few block confirmations
    await new Promise(resolve => setTimeout(resolve, 30000));

    console.log(`\n🔍 Verifying contract on block explorer...`);
    try {
      await run("verify:verify", {
        address: escrowAddress,
        constructorArguments: [mneeAddress],
      });
      console.log(`✅ Contract verified successfully!`);
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log(`✅ Contract already verified!`);
      } else {
        console.log(`⚠️ Verification failed: ${error.message}`);
      }
    }
  }

  console.log(`\n🎉 Deployment complete!\n`);
  console.log(`📋 Summary:`);
  console.log(`   Network: ${networkName}`);
  console.log(`   Escrow Contract: ${escrowAddress}`);
  console.log(`   MNEE Token: ${mneeAddress}`);
  
  return { escrowAddress, mneeAddress };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
