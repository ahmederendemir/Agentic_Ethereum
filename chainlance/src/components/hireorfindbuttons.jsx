import React from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "./walletcontext";

const HireFindBtn = () => {
  const navigate = useNavigate();
  const { walletAddress } = useWallet();

  const handleProtectedRoute = (event, path) => {
    if (!walletAddress) {
      event.preventDefault();
      alert("Please connect your wallet first!");
    } else {
      navigate(path); // Cüzdan bağlıysa yönlendirme işlemi yapılır
    }
  };

  return (
    <div className="flex h-screen">
      <button
        onClick={(e) => handleProtectedRoute(e, "/find-job")}
        className="flex-1 flex items-center justify-center bg-gray-900 text-white text-4xl font-bold transition-all duration-300 hover:bg-gray-950"
        disabled={!walletAddress} // Cüzdan bağlı değilse buton devre dışı
      >
        Find Job
      </button>

      <button
        onClick={(e) => handleProtectedRoute(e, "/hire-someone")}
        className="flex-1 flex items-center justify-center bg-gray-900 text-white text-4xl font-bold transition-all duration-300 hover:bg-gray-950"
        disabled={!walletAddress} // Cüzdan bağlı değilse buton devre dışı
      >
        Hire Someone
      </button>
    </div>
  );
};

export default HireFindBtn;