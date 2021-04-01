require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
const { task } = require("hardhat/config");

const ALCHEMY_ID = process.env.ALCHEMY_ID;
const DEPLOYER_PK = process.env.DEPLOYER_PK;
const DEPLOYER_PK_MAINNET = process.env.DEPLOYER_PK_MAINNET;

if (!ALCHEMY_ID) {
  /* eslint-disable no-console */
  console.log(
    "\n !! IMPORTANT !!\n Must set ALCHEMY_ID in .env before running hardhat"
  );
  process.exit(0);
}

const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

const mainnetAddresses = {
  Gelato: "0x3CACa7b48D0573D793d3b0279b5F0029180E83b6",
  ETH: ETH_ADDRESS,
  GelatoExecutor: "0x3b110ce530bfc5ce5a966fe7fe13f0ea7d56b734",
  GelatoGasPriceOracle: "0x169E633A2D1E6c10dD91238Ba11c4A708dfEF37C",
};

const ropstenAddresses = {
  Gelato: "0xCc4CcD69D31F9FfDBD3BFfDe49c6aA886DaB98d9",
  ETH: ETH_ADDRESS,
  GelatoExecutor: "0x3B110Ce530BfC5Ce5A966Fe7FE13f0ea7d56b734",
  GelatoGasPriceOracle: "0x20F44678Fc2344a78E84192e82Cede989Bf1da6F",
};

module.exports = {
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    maxMethodDiff: 25,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_ID}`,
        blockNumber: 12142763,
      },
      ...mainnetAddresses,
    },
    mainnet: {
      accounts: DEPLOYER_PK_MAINNET ? [DEPLOYER_PK_MAINNET] : [],
      chainId: 1,
      url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_ID}`,
      ...mainnetAddresses,
      gasPrice: 145000000000, // 80 Gwei
    },
    ropsten: {
      accounts: DEPLOYER_PK ? [DEPLOYER_PK] : [],
      chainId: 3,
      url: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_ID}`,
      ...ropstenAddresses,
      gasPrice: 10000000000, // 10 Gwei
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  solidity: {
    compilers: [
      // Gelato contracts
      {
        version: "0.8.0",
        settings: {
          optimizer: require("./solcOptimiserSettings.js"),
        },
      },
      // Krystal contracts
      {
        version: "0.6.6",
        settings: {
          optimizer: require("./solcOptimiserSettings.js"),
        },
      },
      {
        version: "0.6.10",
        settings: {
          optimizer: require("./solcOptimiserSettings.js"),
        },
      },
    ],
  },

  paths: {
    sources: "./contracts",
    tests: "./test/",
  },

  mocha: {
    timeout: 0,
  },
};

task("iswhitelisted", "determines gnosis safe proxy extcodehash")
  .addFlag("log", "Logs return values to stdout")
  .setAction(async (_, hre) => {
    console.log(hre.network.config.addresses.swapProxyAddress);
    console.log(hre.network.config.addresses.platformWalletAddress);
    const smartWalletProxyStorage = await hre.ethers.getContractAt(
      "SmartWalletSwapStorage",
      hre.network.config.addresses.swapProxyAddress
    );

    const isPlatformWallet = await smartWalletProxyStorage.supportedPlatformWallets(
      hre.network.config.addresses.platformWalletAddress
    );
    console.log(`Is PlatformWallet whitelisted? ${isPlatformWallet}`);
  });
