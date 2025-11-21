import { ethers } from 'ethers';
import { CERTI_CHAIN_ABI, VOTE_CHAIN_ABI, FUND_LOCK_ABI } from './contractABIs';

// IMPORTANT: Replace these with your actual deployed contract addresses
export const CONTRACT_ADDRESSES = {
  CERTI_CHAIN: '0x731Ab3383B0B3Ed4cf6910B6F8e9F52003eF1c0a',
  VOTE_CHAIN: '0xd50495782280CAd50584D9D37FD8d69Ea5E17b3b', 
  FUND_LOCK: '0x246ABc5A8FB7af0753A1F378D7b60e96D8c4a780'   
};

export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error('MetaMask not found. Please install MetaMask to use this application.');
};

export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

export const isContractDeployed = async (address: string) => {
  try {
    const provider = getProvider();
    const code = await provider.getCode(address);
    return code !== '0x';
  } catch (error) {
    console.error('Failed to check contract deployment:', error);
    return false;
  }
};

export const getCertiChainContract = async () => {
  const signer = await getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESSES.CERTI_CHAIN, CERTI_CHAIN_ABI, signer);
  
  // Check if contract is deployed
  const isDeployed = await isContractDeployed(CONTRACT_ADDRESSES.CERTI_CHAIN);
  if (!isDeployed) {
    throw new Error('CertiChain contract is not deployed at the specified address');
  }
  
  return contract;
};

export const getVoteChainContract = async () => {
  const signer = await getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESSES.VOTE_CHAIN, VOTE_CHAIN_ABI, signer);
  
  // Check if contract is deployed
  const isDeployed = await isContractDeployed(CONTRACT_ADDRESSES.VOTE_CHAIN);
  if (!isDeployed) {
    throw new Error('VoteChain contract is not deployed at the specified address');
  }
  
  return contract;
};

export const getFundLockContract = async () => {
  const signer = await getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESSES.FUND_LOCK, FUND_LOCK_ABI, signer);
  
  // Check if contract is deployed
  const isDeployed = await isContractDeployed(CONTRACT_ADDRESSES.FUND_LOCK);
  if (!isDeployed) {
    throw new Error('FundLock contract is not deployed at the specified address');
  }
  
  return contract;
};

export const formatEther = (wei: bigint) => {
  return ethers.formatEther(wei);
};

export const parseEther = (ether: string) => {
  return ethers.parseEther(ether);
};

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not found. Please install MetaMask to continue.');
  }
  
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = getProvider();
    const signer = await provider.getSigner();
    return await signer.getAddress();
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('Please connect to MetaMask to continue.');
    }
    throw new Error('Failed to connect wallet. Please try again.');
  }
};

export const switchToNetwork = async (chainId: string) => {
  if (!window.ethereum) return;
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (error: any) {
    console.error('Failed to switch network:', error);
  }
};

export const addTokenToWallet = async (tokenAddress: string, tokenSymbol: string, tokenDecimals: number) => {
  if (!window.ethereum) return;
  
  try {
    await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: [{
        type: 'ERC20',
        options: {
          address: tokenAddress,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
        },
      }] as any,
    });
  } catch (error) {
    console.error('Failed to add token to wallet:', error);
  }
};