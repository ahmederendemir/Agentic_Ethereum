import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import file from "../abi.json";

// Web3Context oluşturuluyor
export const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const _provider = new ethers.BrowserProvider(window.ethereum);
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const _signer = await _provider.getSigner();
          const ERC20_ABI = file.abi;
          const address = "0x94250D9D0b08F4AeC906c5C2cf9601DBf972e88e";
          const _contract = new ethers.Contract(address, ERC20_ABI, _signer);

          setProvider(_provider);
          setSigner(_signer);
          setContract(_contract);
        } catch (error) {
          console.error("Web3 bağlantısı kurulamadı:", error);
        }
      } else {
        console.error("MetaMask veya Web3 sağlayıcı bulunamadı.");
      }
    };

    initWeb3();
  }, []);

  return (
    <Web3Context.Provider value={{ provider, signer, contract }}>
      {children}
    </Web3Context.Provider>
  );
};

// useWeb3 hook'u
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === null) {
    throw new Error("useWeb3 hook'u Web3Provider içinde kullanılmalıdır!");
  }
  return context;
};
