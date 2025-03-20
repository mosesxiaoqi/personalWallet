'use client'
// pages/_app.js
import { useEffect } from 'react';
import { injectEthereumProvider } from './background_old';

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    injectEthereumProvider();
  }, []);

  return <>{children}</>;
}