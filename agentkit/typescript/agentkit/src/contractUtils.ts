import { Contract, JsonRpcProvider, Wallet } from "ethers";
import dotenv from "dotenv";

dotenv.config();

// Sabit Kontrat Adresi (Güncellenmiş haliyle)
const CONTRACT_ADDRESS: string = "0x94250D9D0b08F4AeC906c5C2cf9601DBf972e88e";

// Kontratın ABI'sini ekleyin (Kontratınızda bulunan fonksiyonlara göre düzenleyin)
const CONTRACT_ABI = [
  {
    inputs: [],
    name: "offerWork",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "workId", type: "uint256" }],
    name: "applyOfferedWork",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "workId", type: "uint256" },
      { name: "candidateId", type: "uint256" },
    ],
    name: "reqruitEmployee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "agreementId", type: "uint256" }],
    name: "setEmployeeDone",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "agreementId", type: "uint256" }],
    name: "setEmployerValidate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "agreementId", type: "uint256" }],
    name: "raiseDispute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "agreementId", type: "uint256" },
      { name: "beneficiary", type: "address" },
    ],
    name: "resolveDispute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Sağlayıcıyı oluştur
const getProvider = (): JsonRpcProvider => {
  return new JsonRpcProvider(
    process.env.RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID",
  );
};

/**
 * Kullanıcı cüzdanıyla birlikte çalışan imzalanmış kontratı döndürür.
 *
 * @param signer - Kullanıcının imzalayıcısı (cüzdan)
 * @returns Akıllı kontrat örneği
 */
export const getContract = (signer: Wallet): Contract => {
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

/**
 * Yalnızca okuma amaçlı kontratı döndürür.
 *
 * @returns Read-only contract (Sadece veri çekmek için)
 */
export const getReadOnlyContract = (): Contract => {
  const provider = getProvider();
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};
