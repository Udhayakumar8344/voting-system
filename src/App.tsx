import React, { useState } from 'react';
import { Vote, Menu, X } from 'lucide-react';
import { WalletConnection } from './components/WalletConnection';
import { VotingSystem } from './components/VotingSystem';
import { useWallet } from './hooks/useWallet';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { wallet } = useWallet();

  const tabs = [
    { id: 'voting', name: 'Voting', icon: Vote, color: 'purple' }
  ];

  const getTabButtonClass = (isActive: boolean) => {
    const baseClass = "flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors";
    return isActive
      ? `${baseClass} bg-purple-500 text-white`
      : `${baseClass} text-gray-600 hover:text-gray-900 hover:bg-gray-100`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-lg">
                  <Vote className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Web3 Voting DApp</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={getTabButtonClass(true)}
                >
                  <tab.icon size={18} />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <WalletConnection />

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setMobileMenuOpen(false)}
                    className={getTabButtonClass(true)}
                  >
                    <tab.icon size={18} />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!wallet.isConnected ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Vote className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to the Web3 Voting DApp
              </h2>
              <p className="text-gray-600 mb-8">
                Connect your wallet to create or participate in decentralized votes securely on blockchain.
              </p>
            </div>
          </div>
        ) : (
          <VotingSystem />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>
              Web3 Voting DApp
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
