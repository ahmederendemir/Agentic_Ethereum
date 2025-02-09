import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HireFindBtn = () => {
  const navigate = useNavigate();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      setIsMetaMaskInstalled(true);
      checkWalletConnection();
      window.ethereum.on("accountsChanged", checkWalletConnection); // Cüzdan hesap değiştiğinde tekrar kontrol et
    } else {
      setIsMetaMaskInstalled(false);
    }
  }, []);

  const checkWalletConnection = async () => {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    setIsWalletConnected(accounts.length > 0);
  };

  const handleProtectedRoute = async (event, path) => {
    event.preventDefault();

    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }

    const accounts = await window.ethereum.request({ method: "eth_accounts" });

    if (!accounts.length) {
      alert("Please connect your wallet first!");
    } else {
      navigate(path);
    }
  };

  return (
    <div className="flex h-screen">
      <button
        onClick={(e) => handleProtectedRoute(e, "/find-job")}
        className="flex-1 flex items-center justify-center bg-gray-900 text-white text-4xl font-bold transition-all duration-300 hover:bg-gray-950"
        disabled={!isWalletConnected || !isMetaMaskInstalled} // Cüzdan bağlı değilse ve MetaMask yüklü değilse butonları devre dışı bırak
      >
        Find Job
      </button>

      <button
        onClick={(e) => handleProtectedRoute(e, "/hire-someone")}
        className="flex-1 flex items-center justify-center bg-gray-900 text-white text-4xl font-bold transition-all duration-300 hover:bg-gray-950"
        disabled={!isWalletConnected || !isMetaMaskInstalled} // Cüzdan bağlı değilse ve MetaMask yüklü değilse butonları devre dışı bırak
      >
        Hire Someone
      </button>
    </div>
  );
};

export default HireFindBtn;
