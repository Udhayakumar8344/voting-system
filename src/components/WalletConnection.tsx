import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

export const WalletConnection: React.FC = () => {
  const { wallet, connectWallet, disconnectWallet } = useWallet();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex items-center gap-4">
      {wallet.isConnected ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg">
            <Wallet size={16} />
            <span className="font-medium">{truncateAddress(wallet.address!)}</span>
            {wallet.isAdmin && (
              <span className="text-xs bg-green-200 px-2 py-1 rounded">ADMIN</span>
            )}
          </div>
          <button
            onClick={disconnectWallet}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut size={16} />
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Wallet size={16} />
          Connect Wallet
        </button>
      )}
    </div>
  );
};