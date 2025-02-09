import React, { createContext, useContext, useState, useEffect } from "react";

const WalletContext = createContext();

export const useWallet = () => {
  return useContext(WalletContext);
};

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const checkWalletConnection = async () => {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        setWalletAddress(accounts.length > 0 ? accounts[0] : null);
      };

      checkWalletConnection();

      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts.length > 0 ? accounts[0] : null);
      });
    } else {
      alert("MetaMask is not installed!");
    }
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error("Wallet connecting error:", error);
      }
    } else {
      alert("Metamask is not installed!");
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    alert("Wallet disconnected.");
  };

  return (
    <WalletContext.Provider value={{ walletAddress, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};
