import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { WalletState } from '../types/contracts';
import { getCertiChainContract, getProvider } from '../utils/web3';

export const useWallet = () => {
  console.log('useWallet hook initialized');
  
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    isAdmin: false
  });

  const connectWallet = async () => {
    console.log('Attempting to connect wallet...');
    try {
      if (!window.ethereum) {
        console.log('MetaMask not found');
        alert('Please install MetaMask!');
        return;
      }

      console.log('Getting provider...');
      const provider = getProvider();
      console.log('Requesting accounts...');
      await provider.send('eth_requestAccounts', []);
      console.log('Getting signer...');
      const signer = await provider.getSigner();
      console.log('Getting address...');
      const address = await signer.getAddress();
      console.log('Wallet address:', address);

      // Check if user is admin of CertiChain
      let isAdmin = false;
      try {
        console.log('Checking admin status...');
        const certiContract = await getCertiChainContract();
        const adminAddress = await certiContract.admin();
        isAdmin = adminAddress.toLowerCase() === address.toLowerCase();
        console.log('Admin status:', isAdmin, 'Admin address:', adminAddress);
      } catch (error) {
        console.log('Could not check admin status:', error);
        // Contract might not be deployed yet
      }
      
      setWallet({
        address,
        isConnected: true,
        isAdmin
      });
      console.log('Wallet connected successfully');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const disconnectWallet = () => {
    setWallet({
      address: null,
      isConnected: false,
      isAdmin: false
    });
  };

  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (window.ethereum) {
          const provider = getProvider();
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const address = accounts[0].address;
            
            let isAdmin = false;
            try {
              const certiContract = await getCertiChainContract();
              const adminAddress = await certiContract.admin();
              isAdmin = adminAddress.toLowerCase() === address.toLowerCase();
            } catch (error) {
              console.log('Could not check admin status:', error);
            }
            
            setWallet({
              address,
              isConnected: true,
              isAdmin
            });
          }
        }
      } catch (error) {
        console.error('Failed to check wallet connection:', error);
      }
    };

    checkConnection();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeAllListeners('accountsChanged');
        }
      };
    }
  }, []);

  return { wallet, connectWallet, disconnectWallet };
};