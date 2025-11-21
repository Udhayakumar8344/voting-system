export interface Certificate {
  certHash: string;
  title: string;
  issuedAt: number;
}

export interface Poll {
  id: number;
  title: string;
  candidates: string[];
  votes: number[];
  hasVoted: boolean;
  createdAt: number;
}

export interface Vault {
  id: number;
  donor: string;
  beneficiary: string;
  amount: string;
  unlockTime: number;
  withdrawn: boolean;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isAdmin: boolean;
}