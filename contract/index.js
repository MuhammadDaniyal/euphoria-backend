// import { InterfaceAbi } from "ethers";
// import { ethers } from "ethers";

// interface ContractInfo {
//   abi: InterfaceAbi;
//   address: string;
// }

// export async function getContractVariable(
//   contractInfo: ContractInfo,
//   provider: any
// ) {
//   const { abi, address } = contractInfo;
//   const contract = new ethers.Contract(address, abi, provider);
//   const contractVariable = await contract.someVariable();

//   return contractVariable;
// }

const { ethers } = require("ethers");
const nftSmartContractConstants = require("../constants/nftConstants.json");

// let provider;
// let signer;

// // if (typeof window !== "undefined") {
// // provider = new ethers.providers.Web3Provider(window.ethereum);
// // signer = provider.getSigner();

const getContractInstance = async (provider) => {
  return new ethers.Contract(
    nftSmartContractConstants.address,
    nftSmartContractConstants.abi,
    provider
  );
};

class NftContractInteraction {
  // Checking Confirm and Reject Transactions
  static async processTransaction(txPromise) {
    const tx = await txPromise;
    const receipt = await tx.wait();

    if (receipt.status === 0) {
      throw new Error("Transaction was cancelled.");
    }

    return tx;
  }

  static async createNft(address, tokenId, tokenUri, provider) {
    // Ensure provider is defined
    console.log(provider);
    if (!provider) {
      throw new Error("Provider is not provided.");
    }

    const contract = await getContractInstance(provider);
    console.log(contract);

    // Get contract instance

    // Call contract method to create NFT
    // return this.processTranssaction(contract.mint(address, tokenId, tokenUri));
  }
}

module.exports = NftContractInteraction;
