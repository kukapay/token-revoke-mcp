require('dotenv').config(); // Load environment variables
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');
const { ethers } = require('ethers');

// Configuration
const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const MORALIS_API_BASE_URL = 'https://deep-index.moralis.io/api/v2.2';

// Chain configurations based on Moralis-JS-SDK chaindata.ts with hex string chain IDs
const SUPPORTED_CHAINS = {
  "ethereum": { chainId: "0x1", rpcUrl: "https://rpc.ankr.com/eth" }, // Ethereum Mainnet
  "ropsten": { chainId: "0x3", rpcUrl: "https://rpc.ankr.com/eth_ropsten" }, // Ethereum Testnet Ropsten
  "rinkeby": { chainId: "0x4", rpcUrl: "https://rpc.ankr.com/eth_rinkeby" }, // Ethereum Testnet Rinkeby
  "goerli": { chainId: "0x5", rpcUrl: "https://rpc.ankr.com/eth_goerli" }, // Ethereum Testnet Goerli
  "kovan": { chainId: "0x2a", rpcUrl: "https://rpc.ankr.com/eth_kovan" }, // Ethereum Testnet Kovan
  "polygon": { chainId: "0x89", rpcUrl: "https://polygon-rpc.com" }, // Polygon Mainnet
  "mumbai": { chainId: "0x13881", rpcUrl: "https://rpc-mumbai.maticvigil.com" }, // Polygon Testnet Mumbai
  "bsc": { chainId: "0x38", rpcUrl: "https://bsc-dataseed.binance.org" }, // Binance Smart Chain Mainnet
  "bsc testnet": { chainId: "0x61", rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545" }, // Binance Smart Chain Testnet
  "avalanche": { chainId: "0xa86a", rpcUrl: "https://api.avax.network/ext/bc/C/rpc" }, // Avalanche C-Chain Mainnet
  "avalanche testnet": { chainId: "0xa869", rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc" }, // Avalanche Testnet
  "fantom": { chainId: "0xfa", rpcUrl: "https://rpc.ftm.tools" }, // Fantom Opera Mainnet
  "cronos": { chainId: "0x19", rpcUrl: "https://evm.cronos.org" }, // Cronos Mainnet
  "cronos testnet": { chainId: "0x152", rpcUrl: "https://evm-t3.cronos.org" }, // Cronos Testnet
  "palm": { chainId: "0x2a15c308d", rpcUrl: "https://palm-mainnet.public.blastapi.io" }, // Palm Mainnet
  "arbitrum": { chainId: "0xa4b1", rpcUrl: "https://arb1.arbitrum.io/rpc" }, // Arbitrum One Mainnet
  "arbitrum goerli": { chainId: "0x66eed", rpcUrl: "https://goerli-rollup.arbitrum.io/rpc" }, // Arbitrum Testnet Goerli
  "chiliz": { chainId: "0x15b38", rpcUrl: "https://rpc.ankr.com/chiliz" }, // Chiliz Mainnet
  "chiliz testnet": { chainId: "0x15b32", rpcUrl: "https://testnet-rpc.chiliz.com" }, // Chiliz Testnet
  "gnosis": { chainId: "0x64", rpcUrl: "https://rpc.gnosischain.com" }, // Gnosis Chain Mainnet
  "base": { chainId: "0x2105", rpcUrl: "https://mainnet.base.org" }, // Base Mainnet
  "base goerli": { chainId: "0x14a33", rpcUrl: "https://goerli.base.org" }, // Base Testnet Goerli
  "base sepolia": { chainId: "0x14a34", rpcUrl: "https://sepolia.base.org" }, // Base Testnet Sepolia
  "scroll": { chainId: "0x82750", rpcUrl: "https://rpc.scroll.io" }, // Scroll Mainnet
  "scroll sepolia": { chainId: "0x8274f", rpcUrl: "https://sepolia-rpc.scroll.io" }, // Scroll Testnet Sepolia
  "optimism": { chainId: "0xa", rpcUrl: "https://mainnet.optimism.io" }, // Optimism Mainnet
  "optimism goerli": { chainId: "0x1a4", rpcUrl: "https://goerli.optimism.io" }, // Optimism Testnet Goerli
  "optimism sepolia": { chainId: "0xaa37dc", rpcUrl: "https://sepolia.optimism.io" }, // Optimism Testnet Sepolia
  "klaytn": { chainId: "0x2019", rpcUrl: "https://public-en-cypress.klaytn.net" }, // Klaytn Mainnet Cypress
  "zksync": { chainId: "0x144", rpcUrl: "https://mainnet.era.zksync.io" }, // zkSync Era Mainnet
  "zksync sepolia": { chainId: "0x12c", rpcUrl: "https://sepolia.era.zksync.dev" }, // zkSync Era Testnet Sepolia
  "polygonzkevm": { chainId: "0x44d", rpcUrl: "https://zkevm-rpc.com" }, // Polygon zkEVM Mainnet
  "polygonzkevm testnet": { chainId: "0x585", rpcUrl: "https://rpc.public.zkevm-test.net" }, // Polygon zkEVM Testnet
  "moonriver": { chainId: "0x505", rpcUrl: "https://rpc.api.moonriver.moonbeam.network" }, // Moonriver Mainnet
  "moonbeam": { chainId: "0x504", rpcUrl: "https://rpc.api.moonbeam.network" }, // Moonbeam Mainnet
  "moonbase": { chainId: "0x507", rpcUrl: "https://rpc.api.moonbase.moonbeam.network" }, // Moonbase Alpha Testnet
  "linea": { chainId: "0xe708", rpcUrl: "https://rpc.linea.build" }, // Linea Mainnet
  "linea goerli": { chainId: "0xe704", rpcUrl: "https://rpc.goerli.linea.build" }, // Linea Testnet Goerli
  "core": { chainId: "0x45c", rpcUrl: "https://rpc.coredao.org" }, // Core Blockchain Mainnet
  "aurora": { chainId: "0x4e454152", rpcUrl: "https://mainnet.aurora.dev" }, // Aurora Mainnet
  "aurora testnet": { chainId: "0x4e454153", rpcUrl: "https://testnet.aurora.dev" }, // Aurora Testnet
  "celo": { chainId: "0xa4ec", rpcUrl: "https://forno.celo.org" }, // Celo Mainnet
  "celo alfajores": { chainId: "0xaef3", rpcUrl: "https://alfajores-forno.celo-testnet.org" }, // Celo Alfajores Testnet
  "blast": { chainId: "0x13e31", rpcUrl: "https://rpc.blast.io" }, // Blast Mainnet
  "blast sepolia": { chainId: "0xa0c71fd", rpcUrl: "https://sepolia.blast.io" }, // Blast Sepolia Testnet
  "mantle": { chainId: "0x1388", rpcUrl: "https://rpc.mantle.xyz" }, // Mantle Mainnet
  "mantle sepolia": { chainId: "0x1389", rpcUrl: "https://rpc.sepolia.mantle.xyz" }, // Mantle Sepolia Testnet
  "sei": { chainId: "0x531", rpcUrl: "https://evm-rpc.sei-apis.com" }, // Sei Mainnet
  "sei testnet": { chainId: "0x15e25", rpcUrl: "https://evm-rpc-testnet.sei-apis.com" }, // Sei Testnet
  "rootstock": { chainId: "0x1e", rpcUrl: "https://public-node.rsk.co" }, // Rootstock Mainnet
  "rootstock testnet": { chainId: "0x1f", rpcUrl: "https://public-node.testnet.rsk.co" }, // Rootstock Testnet
  "holesky": { chainId: "0x4268", rpcUrl: "https://rpc.holesky.ethpandaops.io" }, // Holesky Testnet
};

// ERC20 ABI
const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

// Create wallet instance from private key
function createWallet(provider) {
  if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not set in environment variables");
  }
  return new ethers.Wallet(PRIVATE_KEY, provider);
}

// Get default wallet address from private key
const DEFAULT_WALLET_ADDRESS = PRIVATE_KEY ? new ethers.Wallet(PRIVATE_KEY).address : null;

async function main() {
  // Ensure PRIVATE_KEY and MORALIS_API_KEY are set
  if (!DEFAULT_WALLET_ADDRESS) {
    throw new Error("PRIVATE_KEY not set in environment variables");
  }
  if (!MORALIS_API_KEY) {
    throw new Error("MORALIS_API_KEY not set in environment variables");
  }

  // Create MCP Server
  const server = new McpServer({
    name: "TokenRevokeMcp", // Name corresponds to "token-revoke-mcp"
    version: "1.0.0",
    description: "Multi-chain ERC20 token allowance management",
  });

  server.tool(
    "getApprovals",
    "Fetches all ERC20 token approvals for a wallet on a specified chain",
    {
      chain: z.string().optional().default("ethereum").describe(`Blockchain network (e.g., ${Object.keys(SUPPORTED_CHAINS).join(", ")})`),
      walletAddress: z.string().regex(/^(0x[a-fA-F0-9]{40})?$/, "Invalid Ethereum address").optional().default("").describe("Wallet address to check (DEFAULT_WALLET_ADDRESS will be used if not set)"),
    },
    async ({ chain, walletAddress }) => {
      try {
        const selectedChain = SUPPORTED_CHAINS[chain.toLowerCase()];
        if (!selectedChain) {
          throw new Error(`Unsupported chain: ${chain}. Supported chains: ${Object.keys(SUPPORTED_CHAINS).join(", ")}`);
        }
        
        if(!walletAddress) {
          walletAddress = DEFAULT_WALLET_ADDRESS
        }

        // Make HTTP request to Moralis API using fetch
        const url = `${MORALIS_API_BASE_URL}/wallets/${walletAddress}/approvals?chain=${selectedChain.chainId}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            "X-API-Key": MORALIS_API_KEY,
            "Accept": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const allowances = data.result.map(approval => ({
          tokenAddress: approval.token.address,
          tokenSymbol: approval.token.symbol || "Unknown",
          balance: approval.token.current_balance_formatted || "0",
          usdPrice: approval.token.usd_price || "N/A",
          usdValueAtRisk: approval.token.usd_at_risk || "0",
          spenderAddress: approval.spender.address,
          approvedAmount: approval.value_formatted,
          transactionHash: approval.transaction_hash,
          timestamp: approval.block_timestamp
        }));

        return {
          content: [{
            type: "text",
            text: JSON.stringify(allowances, null, 2),
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error fetching allowances: ${error.message}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Tool 2: Revoke a specific token allowance
  server.tool(
    "revokeAllowance",
    "Revokes an ERC20 token allowance for a specific spender on a specified chain",
    {
      chain: z.string().optional().default("ethereum").describe(`Blockchain network (e.g., ${Object.keys(SUPPORTED_CHAINS).join(", ")})`),
      tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address").describe("Token contract address"),
      spenderAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address").describe("Spender address to revoke"),
    },
    async ({ chain, tokenAddress, spenderAddress }) => {
      try {
        const selectedChain = SUPPORTED_CHAINS[chain.toLowerCase()];
        if (!selectedChain) {
          throw new Error(`Unsupported chain: ${chain}. Supported chains: ${Object.keys(SUPPORTED_CHAINS).join(", ")}`);
        }

        const provider = new ethers.JsonRpcProvider(selectedChain.rpcUrl);
        const wallet = createWallet(provider);
        const signedContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

        const tx = await signedContract.approve(spenderAddress, 0);

        return {
          content: [{
            type: "text",
            text: `Allowance revocation submitted on ${chain}. Transaction hash: ${tx.hash}. Note: Transaction is not yet confirmed.`,
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error revoking allowance: ${error.message}`,
          }],
          isError: true,
        };
      }
    }
  );

server.tool(
    "checkTransactionStatus",
    "Checks the status of a transaction on a specified chain",
    {
      chain: z.string().optional().default("ethereum").describe(`Blockchain network (e.g., ${Object.keys(SUPPORTED_CHAINS).join(", ")})`),
      txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash").describe("Transaction hash to check"),
    },
    async ({ chain, txHash }) => {
      try {
        const selectedChain = SUPPORTED_CHAINS[chain.toLowerCase()];
        if (!selectedChain) {
          throw new Error(`Unsupported chain: ${chain}. Supported chains: ${Object.keys(SUPPORTED_CHAINS).join(", ")}`);
        }

        const provider = new ethers.JsonRpcProvider(selectedChain.rpcUrl);
        const receipt = await provider.getTransactionReceipt(txHash);

        if (!receipt) {
          return {
            content: [{
              type: "text",
              text: `Transaction ${txHash} on ${chain} is still pending or not found.`,
            }],
          };
        }

        const status = receipt.status === 1 ? "successful" : "failed";
        return {
          content: [{
            type: "text",
            text: `Transaction ${txHash} on ${chain} has completed with status: ${status}. Block number: ${receipt.blockNumber}.`,
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error checking transaction status: ${error.message}`,
          }],
          isError: true,
        };
      }
    }
  );
  
  // Connect to Stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);

